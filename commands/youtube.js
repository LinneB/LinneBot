const decapi = require("../providers/decapi");

module.exports = {
  name: "youtube",
  aliases: ["youtube", "yt"],
  cooldown: 5000,
  help: "Gets a youtube link based off the given search query.",
  usage: "#youtube <search>",
  run: async function (ctx) {
    if (ctx.parameters < 1) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    const res = await decapi.axios({
      method: "get",
      url: `/youtube/videoid/${ctx.parameters.join(" ")}?show_url`,
    });
    if (res.status === 200) {
      return {
        reply: res.data,
      };
    }
  },
};
