const justlog = require("../providers/justlog");
const logger = require("../misc/logger").getLogger("cmd/randomLog");

module.exports = {
  name: "randomLog",
  aliases: ["randomlog", "rl"],
  cooldown: 3000,
  help: "Gets a random log of a user in a channel from https://logs.ivr.fi",
  usage: "#randomlog <username> <channel>",
  run: async function (ctx) {
    if (ctx.parameters.length < 2) {
      return {
        reply: `${
          ctx.parameters.length < 1
            ? "No username provided"
            : "No channel provided"
        }. Usage: ${this.usage}`,
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
    logger.error(`Justlog returned unexpected status code ${res.status}`);
  },
  examples: [
    {
      description: [
        'Get a random log for a user in a channel from <a class="hyperlink" href="https://logs.ivr.fi">logs.ivr.fi</a>',
      ],
      command: "#rl linneb forsen",
      response:
        "@LinneB, [2023-09-09 20:28:00] LinneB: elisDancing LETS elisDancing GO elisDancing FORSEN elisDancing",
    },
  ],
};
