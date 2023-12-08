const helix = require("../providers/helix");
const ivr = require("../providers/ivr");
const { log } = require("../misc/utils");

module.exports = {
  name: "title",
  aliases: ["#title"],
  cooldown: 3000,
  help: "Sends the title of a channel.",
  usage: "#title <channel>",
  run: async function(ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const userid = await ivr.usernameToID(ctx.parameters[0]);
    if (!userid) {
      return {
        reply: `User ${ctx.parameters[0]} not found`
      };
    }
    const res = await helix.axios({
      method: "get",
      url: `/channels?broadcaster_id=${userid}`,
    });
    if (res.status === 200) {
      const { title, broadcaster_name } = res.data.data[0];
      return {
        reply: `${broadcaster_name}'s title is: ${title}`
      };
    } else {
      log("error", `Helix returned unexpected status code ${res.status}`);
    }
  }
};
