const { log } = require("../misc/utils");
const ivr = require("../providers/ivr");
const mongodb = require("../providers/mongodb");

module.exports = {
  name: "livenotif",
  cooldown: 1000,
  aliases: ["livenotif"],
  help: "Adds/removes channels from livenotif. Mod required.",
  usage: "#livenotif <add|remove> <channel>",
  run: async function (ctx) {
    const tes = require("../providers/eventsub");
    if (!ctx.isMod && !ctx.broadcaster && ctx.senderUsername !== "linneb") {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    const subCommand = ctx.parameters[0].toLowerCase();
    const channel = ctx.parameters[1].toLowerCase();
    const userid = await ivr.usernameToID(channel);
    if (!userid) {
      return {
        reply: `Channel ${channel} not found`,
      };
    }
    if (subCommand === "add") {
      const channelData = await mongodb.getChannelData(ctx.roomName);
      if (channelData.subscriptions.some((sub) => sub.channel === channel)) {
        return {
          reply: `This chat is already subscribed to ${channel}. Use #notify ${channel} to be notified when they go live`,
        };
      }
      log(
        "info",
        `Subscribing to ${channel} in ${ctx.roomName} (issued by ${ctx.senderDisplayName})`,
      );
      await tes.subscribeIfNot([userid]);
      channelData.subscriptions.push({ channel: channel });
      await channelData.save();
      return {
        reply: `Subscribed to ${channel}`,
      };
    }
    if (subCommand === "remove") {
      const channelData = await mongodb.getChannelData(ctx.roomName);
      if (!channelData.subscriptions.some((sub) => sub.channel === channel)) {
        return {
          reply: `This chat is not subscribed to ${channel}`,
        };
      }
      log(
        "info",
        `Unsubscribing from ${channel} in ${ctx.roomName} (issued by ${ctx.senderDisplayName})`,
      );
      channelData.subscriptions = channelData.subscriptions.filter(
        (sub) => sub.channel !== channel,
      );
      await channelData.save();
      await tes.unsubscribeUnused();
      return {
        reply: `Unsubscribed from ${channel}`,
      };
    }
  },
};
