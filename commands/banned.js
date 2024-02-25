const ivr = require("../providers/ivr");

module.exports = {
  name: "banned",
  aliases: ["banned", "isbanned"],
  cooldown: 3000,
  help: "Checks if a user is banned from Twitch.",
  usage: "#banned <user>",
  run: async function (ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `No username provided. Usage: ${this.usage}`,
      };
    }
    const user = await ivr.getUser(ctx.parameters[0]);
    if (user) {
      if (user.banned === true) {
        return {
          reply: `BOP ${user.displayName} is BANNED. ${user.banReason}`,
        };
      }
      return {
        reply: `${user.displayName} is not banned`,
      };
    }
    return {
      reply: `User ${ctx.parameters[0]} not found`,
    };
  },
  examples: [
    {
      description: ["Check if a user is Twitch banned"],
      command: "#banned linneb",
      response: "@LinneB, LinneB is not banned",
    },
    {
      description: [""],
      command: "#banned drdisrespect",
      response: "@LinneB, BOP DrDisrespect is BANNED. TOS_INDEFINITE",
    },
  ],
};
