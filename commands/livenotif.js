const logger = require("../misc/logger").getLogger("cmd/livenotif");
const ivr = require("../providers/ivr");
const db = require("../providers/postgres");
const tes = require("../providers/eventsub");

module.exports = {
  name: "livenotif",
  cooldown: 1000,
  aliases: ["livenotif"],
  help: "Adds/removes channels from livenotif. Mod required.",
  usage: "#livenotif <add|remove> <channel>",
  run: async function (ctx) {
    if (!ctx.isMod && !ctx.broadcaster && ctx.senderUsername !== "linneb") {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`,
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
          if (res.rowCount < 1) {
            return null;
          }
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
          logger.error("Could not add subscription to database: ", err);
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
          if (res.rowCount < 1) {
            return null;
          }
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
      reply: `Usage: ${this.usage}`,
    };
  },
};
