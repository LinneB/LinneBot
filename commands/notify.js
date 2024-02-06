const db = require("../providers/postgres");
const logger = require("../misc/logger").getLogger("cmd/notify");

module.exports = {
  name: "notify",
  cooldown: 1000,
  aliases: ["notify"],
  help: "Subscribe/unsubscribe to a live notification.",
  usage: "#notify <channel>",
  run: async function (ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }

    const subscriptionUsername = ctx.parameters[0].toLowerCase();

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
        reply: `This chat is not subscribed to ${subscriptionUsername}, you can subscribe to it using #livenotif add ${subscriptionUsername}`,
      };
    }

    const subscriptionID = subscription.subscription_id;

    const subscriber = await db.pool
      .query(db.queries.SELECT.getSubscriber, [
        ctx.roomID,
        subscriptionUsername,
        ctx.senderUsername,
      ])
      .then((res) => {
        if (res.rowCount < 1) {
          return null;
        }
        return res.rows[0];
      });

    if (subscriber) {
      // Unsubscribe user
      await db.pool
        .query(db.queries.DELETE.deleteSubscriber, [
          ctx.roomID,
          ctx.senderUsername,
          subscriptionID,
        ])
        .catch((err) => {
          logger.error("Could not unsubscribe user: ", err);
        });
      return {
        reply: `Unsubscribed from ${subscriptionUsername}. You will no longer be notified when they go live`,
      };
    }

    // Subscribe user
    await db.pool
      .query(db.queries.INSERT.addSubscriber, [
        ctx.roomID,
        ctx.senderUsername,
        subscriptionID,
      ])
      .catch((err) => {
        logger.error("Could not subscribe user: ", err);
      });
    return {
      reply: `Subscribed to ${subscriptionUsername}. You will be notified when they go live`,
    };
  },
};
