const helix = require("../providers/helix");
const ivr = require("../providers/ivr");
const { log } = require("../misc/utils");

module.exports = {
  name: "thumbnail",
  aliases: ["thumbnail"],
  cooldown: 3000,
  help: "Gets the thumbnail of a stream.",
  usage: "#thumbnail <channel>",
  run: async function (ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    const channel = ctx.parameters[0];
    const userid = await ivr.usernameToID(channel);
    if (!userid) {
      return {
        reply: `User ${channel} not found`,
      };
    }
    const res = await helix.axios({
      method: "get",
      url: `/streams?user_id=${userid}`,
    });
    if (res.status === 200) {
      const data = res.data.data;
      if (data.length < 1) {
        return {
          reply: `${ctx.parameters[0]} is offline`,
        };
      }
      const link = data[0].thumbnail_url.replace(
        /\{width\}x\{height\}/g,
        "1920x1080",
      );
      return {
        reply: link,
      };
    }
    log("error", `Helix returned unexpected status code ${res.status}`);
  },
};
