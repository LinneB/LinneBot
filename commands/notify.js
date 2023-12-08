const { getConfig, setConfig } = require("../misc/config");

module.exports = {
  name: "notify",
  cooldown: 1000,
  aliases: ["#notify"],
  help: "Subscribe/unsubscribe to a live notification.",
  usage: "#notify <channel>",
  run: function(ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const livenotif = getConfig("livenotif");
    const channel = ctx.parameters[0].toLowerCase();
    if (Object.keys(livenotif).includes(channel)) {
      if (livenotif[channel].includes(ctx.senderUsername)) {
        livenotif[channel] = livenotif[channel].filter(e => e !== ctx.senderUsername);
        setConfig("livenotif", livenotif);
        return {
          reply: `Unsubscribed from ${channel}. You will no longer be notified when they go live`
        };
      } else {
        livenotif[channel].push(ctx.senderUsername);
        setConfig("livenotif", livenotif);
        return {
          reply: `Subscribed to ${channel}. You will be notified when they go live`
        };
      }
    } else {
      return {
        reply: "Channel is not being tracked"
      };
    }
  }
};
