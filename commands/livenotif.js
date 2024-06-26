import db from "../providers/postgres.js";
import ivr from "../providers/ivr.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("cmd/livenotif");
import tes from "../providers/eventsub.js";

export default {
    name: "livenotif",
    cooldown: 1000,
    aliases: ["livenotif"],
    help: "Adds/removes channels from livenotif. Mod required.",
    usage: "#livenotif <add|remove> <channel>",
    run: async function (ctx) {
        if (!ctx.isMod && !ctx.broadcaster && !ctx.admin) {
            return;
        }
        if (ctx.parameters.length < 2) {
            return {
                reply: `${
                    ctx.parameters.length < 1
                        ? "No subcommand provided"
                        : "No channel provided"
                }. Usage: ${this.usage}`,
            };
        }
        const subCommand = ctx.parameters[0].toLowerCase();
        const subscriptionUsername = ctx.parameters[1].toLowerCase();
        const subscriptionUserID = await ivr.usernameToID(subscriptionUsername);
        if (!subscriptionUserID) {
            return {
                reply: `Channel ${subscriptionUsername} not found`,
            };
        }

        if (subCommand === "add") {
            const subscription = await db.pool
                .query(db.queries.SELECT.getSubscription, [
                    ctx.roomID,
                    subscriptionUsername,
                ])
                .then((res) => {
                    if (res.rowCount < 1) return null;
                    return res.rows[0];
                });
            if (subscription) {
                return {
                    reply: `This chat is already subscribed to ${subscriptionUsername}`,
                };
            }

            logger.info(
                `Subscribing to ${subscriptionUsername} in ${ctx.roomName} (issued by ${ctx.senderDisplayName})`,
            );
            await db.pool
                .query(db.queries.INSERT.addSubscription, [
                    ctx.roomID,
                    subscriptionUsername,
                    subscriptionUserID,
                ])
                .catch((err) => {
                    logger.error(
                        "Could not add subscription to database: ",
                        err,
                    );
                });
            tes.subscribeIfNot([subscriptionUserID]);
            return {
                reply: `Subscribed to ${subscriptionUsername}`,
            };
        }

        if (subCommand === "remove") {
            const subscription = await db.pool
                .query(db.queries.SELECT.getSubscription, [
                    ctx.roomID,
                    subscriptionUsername,
                ])
                .then((res) => {
                    if (res.rowCount < 1) return null;
                    return res.rows[0];
                });
            if (!subscription) {
                return {
                    reply: `This chat is not subscribed to ${subscriptionUsername}`,
                };
            }

            logger.info(
                `Unsubscribing from ${subscriptionUsername} in ${ctx.roomName} (issued by ${ctx.senderDisplayName})`,
            );
            await db.pool.query(db.queries.DELETE.deleteSubscription, [
                ctx.roomID,
                subscriptionUserID,
            ]);
            await tes.unsubscribeUnused();
            return {
                reply: `Unsubscribed from ${subscriptionUsername}`,
            };
        }

        return {
            reply: `Invalid subcommand provided. Usage: ${this.usage}`,
        };
    },
    examples: [
        {
            description: [
                "Add a channel to the current chats live notifications",
            ],
            command: "#livenotif add forsen",
            response: "@LinneB, Subscribed to forsen",
        },
        {
            description: [
                "The bot will now send a message when that channel goes live",
            ],
            response:
                'https://twitch.tv/forsen just went live playing Just Chatting! "Games and shit!"',
        },
        {
            description: [
                'You can use the <a class="hyperlink" href="https://bot.linneb.xyz/command/notify">notify</a> command to be added as a subscriber to that subscription',
            ],
            response:
                'https://twitch.tv/forsen just went live playing Just Chatting! "Games and shit!" @linneb',
        },
    ],
};
