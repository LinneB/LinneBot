const tmiClient = require("../providers/irc");
const helix = require("../providers/helix");
const commands = require("../misc/commands");
const db = require("../providers/postgres");
const tes = require("../providers/eventsub");
const ivr = require("../providers/ivr");
const { getConfig } = require("../misc/config");
const { makeStreamOnlineMessages } = require("../misc/utils");
const logger = require("../misc/logger").getLogger("handler");

function buildMessageContext(msg) {
  const args = msg.messageText.split(" ").filter((c) => c.trim());
  const command = args[0].toLowerCase();

  return {
    message: msg.messageText,
    senderUsername: msg.senderUsername,
    senderDisplayName: msg.displayName,
    senderUserID: msg.senderUserID,
    args: args,
    command: command,
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

exports.onChat = async (msg) => {
  const ctx = buildMessageContext(msg);
  const chat = await db.pool
    .query({
      text: db.queries.SELECT.getChat,
      values: [ctx.roomID],
    })
    .then((res) => res.rows[0]);
  if (!chat) {
    logger.error("Got a message in a chat not in database, ignoring");
    return;
  }

  const prefix = chat.prefix;
  if (!ctx.command.startsWith(prefix)) {
    return;
  }
  // Interactive command
  const command = commands.getCommandByAlias(ctx.command.slice(prefix.length));
  if (command) {
    if (commands.isOnCooldown(ctx.senderUserID, command)) {
      logger.info(`Executing ${command.name}`);
      try {
        const result = await command.run(ctx);
        if (result?.reply) {
          tmiClient.sendMessage(
            ctx.roomName,
            `@${ctx.senderDisplayName}, ${result.reply}`,
          );
        }
      } catch (e) {
        logger.error("Command execution failed:", e);
      }
    }
  }
  // Static command
  // TODO: Global static commands, eg. #github
  const result = await db.pool.query(db.queries.SELECT.getCommand, [
    ctx.roomID,
    ctx.command.slice(prefix.length),
  ]);
  if (result.rowCount >= 1) {
    const staticCommand = result.rows[0];
    if (commands.isOnCooldown(ctx.senderUserID, staticCommand)) {
      logger.info(`Executing ${staticCommand.name}`);
      tmiClient.sendMessage(
        ctx.roomName,
        `@${ctx.senderDisplayName}, ${staticCommand.reply}`,
      );
    }
  }
};

exports.onReady = async () => {
  // TODO: How does this work if a chat changes name
  logger.info("Connected to chat");
  const channels = await db.pool
    .query(db.queries.SELECT.getChats)
    .then((res) => {
      if (res.rowCount < 1) {
        return null;
      }
      return res.rows;
    })
    .catch((err) => {
      logger.error("Could not get channels: ", err);
    });

  if (!channels) {
    logger.warn("No channels in database, falling back to config file");
    const channelUsername = getConfig("initialChannel");
    if (!channelUsername) {
      logger.fatal("No inital channel provided in config file");
      process.exit(1);
    }
    const channelID = await ivr.usernameToID(channelUsername);
    if (!channelID) {
      logger.fatal(
        `Could not get user ID for ${channelUsername}. Does this user exist?`,
      );
      process.exit(1);
    }
    db.pool
      .query(db.queries.INSERT.addChat, [channelID, channelUsername])
      .then(() => {
        tmiClient.join(channelUsername);
      })
      .catch((err) => {
        logger.error("Could not add chat: ", err);
      });
  } else {
    logger.info(
      `Joining ${channels.length} ${channels.length > 1 ? "chats" : "chat"}`,
    );
    tmiClient.joinAll(channels.map((channel) => channel.user_name));
  }
};

exports.streamOnline = async (event) => {
  const streamUsername = event.broadcaster_user_login.toLowerCase();
  const streamUserID = event.broadcaster_user_id;

  const subscribedChats = await db.pool
    .query(db.queries.SELECT.getSubscribedChatsByUserID, [streamUserID])
    .then((res) => {
      if (res.rowCount < 1) {
        return {};
      }
      const subscribedChats = {};
      for (const row of res.rows) {
        subscribedChats[row.user_name] = [];
      }
      return subscribedChats;
    });

  if (Object.keys(subscribedChats).length < 1) {
    // Notification received for channel not in database
    logger.info(
      `Got notification for unused channel ${streamUsername}, removing...`,
    );
    tes
      .unsubscribe("stream.online", {
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
      if (res.rowCount < 1) {
        return;
      }
      for (const row of res.rows) {
        subscribedChats[row.chat_username].push(row.subscriber_username);
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
        tmiClient.sendMessage(chat, message);
      }
    }
  } else {
    logger.error(`Helix returned unexpected status code ${res.status}`);
    const streamMessage = `https://twitch.tv/${streamUsername} just went live!`;
    for (const [chat, subs] of Object.entries(subscribedChats)) {
      const messages = makeStreamOnlineMessages(streamMessage, subs);
      for (const message of messages) {
        tmiClient.sendMessage(chat, message);
      }
    }
  }
};
