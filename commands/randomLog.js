const justlog = require("../providers/justlog");
const { log } = require("../misc/utils");

module.exports = {
  name: "randomLog",
  aliases: ["randomlog", "rl"],
  cooldown: 3000,
  help: "Gets a random log of a user in a channel from https://logs.ivr.fi",
  usage: "#randomlog <username> <channel>",
  run: async function (ctx) {
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    const username = ctx.parameters[0];
    const channel = ctx.parameters[1];
    const res = await justlog.axios({
      method: "get",
      url: `/channel/${channel}/user/${username}/random?jsonBasic=true`,
    });
    if (res.status === 200) {
      const { text, displayName, timestamp } = res.data.messages[0];
      return {
        reply: `[${new Date(timestamp).toLocaleString(
          "sv-SE",
        )}] ${displayName}: ${text}`,
      };
    }
    if (res.status === 404) {
      return {
        reply:
          "Username/channel not found, make sure channel is being logged on https://logs.ivr.fi",
      };
    }
    log("error", `Justlog returned unexpected status code ${res.status}`);
  },
};
