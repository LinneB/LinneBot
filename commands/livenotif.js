const { getConfig, setConfig } = require("../misc/config");
const { log } = require("../misc/utils");
const ivr = require("../providers/ivr");

module.exports = {
  name: "livenotif",
  cooldown: 1000,
  aliases: ["#livenotif"],
  help: "Adds/removes channels from livenotif. Admin required.",
  usage: "#livenotif <add|remove> <channel>",
  run: async function(ctx) {
    const tes = require("../providers/eventsub");
    if (!getConfig("admins").includes(ctx.senderUsername)) {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const livenotif = getConfig("livenotif");
    const subCommand = ctx.parameters[0].toLowerCase();
    const channel = ctx.parameters[1].toLowerCase();
    const userid = await ivr.usernameToID(channel);
    if (!userid) {
      return {
        reply: `Channel ${channel} not found`
      };
    }
    if (subCommand === "add") {
      if (channel in livenotif) {
        return {
          reply: `${channel} is already in livenotif`
        };
      }
      try {
        log("info", `Adding ${channel} to livenotif (issued by ${ctx.senderDisplayName})`);
        await tes.subscribe("stream.online", { broadcaster_user_id: userid });
        livenotif[channel] = [];
        setConfig("livenotif", livenotif);
        return {
          reply: `Subscribed to ${channel}`
        };
      } catch (err) {
        log("error", err);
      }
    } else if (subCommand === "remove") {
      if (!(channel in livenotif)) {
        return {
          reply: `${channel} is not in livenotif`
        };
      }
      try {
        log("info", `Removing ${channel} from livenotif (issued by ${ctx.senderDisplayName})`);
        await tes.unsubscribe("stream.online", { broadcaster_user_id: userid });
        delete livenotif[channel];
        setConfig("livenotif", livenotif);
        return {
          reply: `Unsubscribed from ${channel}`
        };
      } catch (err) {
        log("error", err);
      }
    }
  }
};
