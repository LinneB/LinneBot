const TES = require("tesjs");
const { log } = require("../misc/utils");
const ivr = require("./ivr");
const db = require("../providers/postgres");
const { getConfig } = require("../misc/config");
const { expressApp } = require("../web");

const tes = new TES({
  identity: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  listener: {
    type: "webhook",
    baseURL: process.env.BASE_URL,
    secret: process.env.WEBHOOK_SECRET,
    server: expressApp,
    port: getConfig("port"),
  },
  options: {
    debug: getConfig("debug") || false,
  },
});

// Creates subscription for `userid` if none exists
tes.subscribeIfNot = async function (userIDs = []) {
  const subscriptions = await this.getSubscriptionsByStatus("enabled");
  const subscribedIDs = subscriptions.data.map(
    (sub) => sub.condition.broadcaster_user_id,
  );
  for (const userid of userIDs) {
    if (!subscribedIDs.includes(userid)) {
      tes
        .subscribe("stream.online", { broadcaster_user_id: userid })
        .then(() => {
          log("debug", `Subscription created for ${userid}`);
        })
        .catch((err) => {
          log("error", `Could not subscribe to ${userid}`, err);
        });
    } else {
      log("debug", `Subscription for ${userid} already exists, skipping`);
    }
  }
};

// Removes subscriptions that are not used by any chat
tes.unsubscribeUnused = async function () {
  const subscribedIDs = await db.pool
    .query(db.queries.SELECT.getSubscriptions)
    .then((res) => {
      if (res.rowCount < 1) {
        return [];
      }
      return res.rows.map((sub) => sub.subscription_user_id.toString());
    })
    .catch((err) => {
      log("error", "Could not get subscribed channels from database", err);
    });

  const subscriptions = await this.getSubscriptionsByStatus("enabled");
  for (const sub of subscriptions.data) {
    const channelID = sub.condition.broadcaster_user_id;
    if (!subscribedIDs.includes(channelID)) {
      this.unsubscribe(sub.id).then(() => {
        log("info", `Unsubscribed from unused channel ${channelID}`);
      });
    }
  }
};

// Gets all subscribed channels from database
async function subscribeToChannels() {
  log("info", "Initializing EventSub...");
  const subscribedIDs = await db.pool
    .query(db.queries.SELECT.getSubscriptions)
    .then((res) => {
      if (res.rowCount < 1) {
        return [];
      }
      return res.rows.map((sub) => sub.subscription_user_id.toString());
    })
    .catch((err) => {
      log("error", "Could not get subscribed channels from database", err);
    });
  if (subscribedIDs.length < 1) {
    return;
  }
  log(
    "info",
    `Subscribing to ${subscribedIDs.length} ${
      subscribedIDs.length === 1 ? "channel" : "channels"
    }`,
  );
  tes.subscribeIfNot(subscribedIDs);
}

subscribeToChannels();

module.exports = tes;
