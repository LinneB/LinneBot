const TES = require("tesjs");
const { log } = require("../misc/utils");
const ivr = require("./ivr");
const mongodb = require("./mongodb");
const { getConfig } = require("../misc/config");
const { expressApp } = require("../web");
const { streamOnline } = require("../misc/handler");

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
  options: { debug: getConfig("debug") || false }
});

tes.on("stream.online", streamOnline);

// Creates subscription for `userid` if none exists
tes.subscribeIfNot = async function(userIDs = []) {
  const subscriptions = await this.getSubscriptionsByStatus("enabled");
  const subscribedIDs = subscriptions.data.map(sub => sub.condition.broadcaster_user_id);
  for (const userid of userIDs) {
    if (!subscribedIDs.includes(userid)) {
      tes.subscribe("stream.online", { broadcaster_user_id: userid }).then(() => {
        log("debug", `Subscription created for ${userid}`);
      }).catch((err) => {
        log("error", `Could not subscribe to ${userid}`, err);
      });
    } else {
      log("debug", `Subscription for ${userid} already exists, skipping`);
    }
  }
};

// Removes subscriptions that are not used by any chat
tes.unsubscribeUnused = async function() {
  const channels = getConfig("channels");
  const channelsData = await mongodb.ChannelModel.find({ "channel": { $in: channels } });
  const subscribedChannels = new Set();
  for (const channelData of channelsData) {
    channelData.subscriptions.forEach(sub => subscribedChannels.add(sub.channel));
  }

  const res = await ivr.axios({
    method: "get",
    url: `/twitch/user?login=${[...subscribedChannels].join("%2C")}`
  });
  if (res.status !== 200) {
    log("error", `IVR returned unexpected status code ${res.status}`);
    return;
  }
  const subscribedIDs = res.data.map(user => user.id);
  const subscriptions = await this.getSubscriptionsByStatus("enabled");
  subscriptions.data.forEach(sub => {
    const channelID = sub.condition.broadcaster_user_id;
    if (!subscribedIDs.includes(channelID)) {
      this.unsubscribe(sub.id).then(() => {
        log("info", `Unsubscribed from unused channel ${channelID}`);
      });
    }
  });
};

// Gets all subscribed channels from database
async function subscribeToChannels() {
  const channels = getConfig("channels");
  const channelsData = await Promise.all(channels.map(channel => {
    return mongodb.getChannelData(channel);
  }));
  const subscribedChannels = [];
  for (const channelData of channelsData) {
    for (const sub of channelData.subscriptions) {
      if (!subscribedChannels.includes(sub.channel)) {
        subscribedChannels.push(sub.channel);
      }
    }
  }
  if (subscribedChannels.length < 1) {
    return;
  }
  const res = await ivr.axios({
    method: "get",
    url: `/twitch/user?login=${subscribedChannels.join("%2C")}`
  });
  const channelIDs = res.data.map(user => user.id);
  log("info", `Subscribing to ${channelIDs.length} ${channelIDs.length > 1 ? "channels" : "channel"}`);
  tes.subscribeIfNot(channelIDs);
}
subscribeToChannels();

module.exports = tes;
