import "dotenv/config";
import "./misc/commandServer.js";
import db from "./providers/postgres.js";
import helix from "./providers/helix.js";
import interceptors from "./interceptors/index.js";
import irc from "./providers/irc.js";
import ivr from "./providers/ivr.js";
import log4js from "./misc/logger.js";
const logger = log4js.getLogger("index");
import { makeStreamOnlineMessages } from "./misc/utils.js";
import tes from "./providers/eventsub.js";

function buildMessageContext(msg) {
    const args = msg.messageText.split(" ").filter((c) => c.trim());

    return {
        message: msg.messageText,
        senderUsername: msg.senderUsername,
        senderDisplayName: msg.displayName,
        senderUserID: msg.senderUserID,
        args: args,
        parameters: args.slice(1),
        broadcaster: msg.senderUserID === msg.channelID,
        roomID: msg.channelID,
        roomName: msg.channelName,
        isMod: msg.isMod,
        // TODO: Configurable "admin" users
        admin: msg.senderUsername === "linneb",
        ircMsg: msg,
    };
}

async function onMessage(msg) {
    const ctx = buildMessageContext(msg);
    const chat = await db.pool
        .query({
            text: db.queries.SELECT.getChat,
            values: [ctx.roomID],
        })
        .then((res) => {
            if (res.rowCount < 1) return null;
            return res.rows[0];
        });
    if (!chat) {
        logger.error("Got a message in a chat not in database, ignoring");
        return;
    }

    ctx.prefix = chat.prefix;
    ctx.command = ctx.args[0].slice(ctx.prefix.length);
    ctx.blacklist = chat.blacklist;

    if (!ctx.message.startsWith(ctx.prefix)) return;

    for (const interceptor of interceptors) {
        const reply = await interceptor(ctx);
        if (reply) {
            irc.sendMessage(ctx.roomName, `@${ctx.senderUsername}, ${reply}`);
        }
    }
}

async function onReady() {
    logger.info("Connected to chat, joining channels");
    const chats = await db.pool
        .query({
            text: db.queries.SELECT.getChats,
        })
        .then((res) => {
            if (res.rowCount < 1) return null;
            return res.rows;
        });
    if (chats) {
        logger.info(`Joining ${chats.length} channels from database`);
        irc.joinAll(chats.map((chat) => chat.user_name));
        return;
    }

    logger.info("No channels found in database, falling back to .env");
    const channelName = process.env.INITIAL_CHANNEL;
    if (!channelName) {
        logger.fatal("No INITIAL_CHANNEL provided in .env");
    }

    const channelID = await ivr.usernameToID(channelName);
    if (!channelID) {
        logger.fatal(
            `Could not get user ID for initial channel "${channelName}". Does this user exist?`,
        );
    }

    logger.info(`Adding ${channelName} to database and joining`);
    db.pool.query({
        text: db.queries.INSERT.addChat,
        values: [channelID, channelName],
    });
    irc.join(channelName);
}

async function onLive(event) {
    const streamUsername = event.broadcaster_user_login.toLowerCase();
    const streamUserID = event.broadcaster_user_id;

    const subscribedChats = await db.pool
        .query(db.queries.SELECT.getSubscribedChatsByUserID, [streamUserID])
        .then((res) => {
            if (res.rowCount < 1) return {};
            const subscribedChats = {};
            for (const row of res.rows) {
                subscribedChats[row.user_name] = [];
            }
            return subscribedChats;
        });

    if (Object.keys(subscribedChats).length < 1) {
        // Notification received for channel not in database
        logger.info(`Removing unused subscription for ${streamUsername}...`);
        tes.unsubscribe("stream.online", {
            broadcaster_user_id: streamUserID,
        })
            .then(() => {
                logger.debug(`Removed subscription for ${streamUsername}`);
            })
            .catch(() => {
                logger.debug(`Could not unsubscribe from ${streamUsername}`);
            });
        return;
    }

    await db.pool
        .query(db.queries.SELECT.getSubscribersByUserID, [streamUserID])
        .then((res) => {
            if (res.rowCount < 1) return;
            for (const row of res.rows) {
                subscribedChats[row.chat_username].push(
                    row.subscriber_username,
                );
            }
        });

    const res = await helix.axios({
        method: "get",
        url: `/channels?broadcaster_id=${streamUserID}`,
    });
    if (res.status === 200) {
        const { game_name, title } = res.data.data[0];
        const streamMessage = `https://twitch.tv/${streamUsername} just went live playing ${game_name}! "${title}"`;

        for (const [chat, subs] of Object.entries(subscribedChats)) {
            const messages = makeStreamOnlineMessages(streamMessage, subs);
            for (const message of messages) {
                irc.sendMessage(chat, message);
            }
        }
    } else {
        logger.error(`Helix returned unexpected status code ${res.status}`);
        const streamMessage = `https://twitch.tv/${streamUsername} just went live!`;
        for (const [chat, subs] of Object.entries(subscribedChats)) {
            const messages = makeStreamOnlineMessages(streamMessage, subs);
            for (const message of messages) {
                irc.sendMessage(chat, message);
            }
        }
    }
}

if (!(await helix.validateToken())) {
    logger.fatal("Invalid user token");
    process.exit(1);
}

irc.on("PRIVMSG", onMessage);
irc.on("ready", onReady);

tes.on("stream.online", onLive);

irc.connect();

process.on("SIGTERM", () => {
    logger.info("Exiting...");
    process.exit(0);
});
