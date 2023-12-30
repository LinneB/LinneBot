const mongodb = require("../providers/mongodb");

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
    const channel = ctx.parameters[0].toLowerCase();
    const channelData = await mongodb.getChannelData(ctx.roomName);

    for (const sub of channelData.subscriptions) {
      if (sub.channel !== channel) {
        continue;
      }
      if (sub.subscribers.includes(ctx.senderUsername)) {
        // unsubscribe user
        sub.subscribers = sub.subscribers.filter(
          (u) => u !== ctx.senderUsername,
        );
        channelData.save();
        return {
          reply: `Unsubscribed from ${channel}. You will no longer be notified when they go live`,
        };
      }
      // subscribe user
      sub.subscribers.push(ctx.senderUsername);
      channelData.save();
      return {
        reply: `Subscribed to ${channel}. You will be notified when they go live`,
      };
    }
    return {
      reply: `This chat is not subscribed to ${channel}, you can subscribe to it using #livenotif add ${channel}`,
    };
  },
};
