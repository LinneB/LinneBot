const helix = require("../providers/helix");
const logger = require("../misc/logger").getLogger("cmd/live");

module.exports = {
  name: "live",
  aliases: ["live", "stream"],
  cooldown: 3000,
  help: "Sends information about a stream.",
  usage: "#live <user>",
  run: async function (ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    const username = ctx.parameters[0].toLowerCase().replace("@", "");
    const res = await helix.axios({
      method: "get",
      url: `/streams?user_login=${username}`,
    });
    if (res.status === 200) {
      if (res.data.data.length > 0) {
        const { user_login, game_name, viewer_count, started_at, title } =
          res.data.data[0];
        const currentTime = new Date();
        const startedTime = new Date(started_at);
        const timeDifference = currentTime - startedTime;
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
        );
        return {
          reply: `https://twitch.tv/${user_login} has been live for ${hours}h, ${minutes}m with ${viewer_count} viewers playing "${game_name}". ${title}`,
        };
      }
      return {
        reply: `${username} is offline`,
      };
    }
    if (res.status === 400) {
      return {
        reply: `User ${username} not found`,
      };
    }
    logger.error(`Helix returned unexpected status code ${res.status}`);
  },
};
