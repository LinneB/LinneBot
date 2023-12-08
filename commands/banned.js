const ivr = require("../providers/ivr");

module.exports = {
  name: "banned",
  aliases: ["#banned", "#isbanned"],
  cooldown: 3000,
  help: "Checks if a user is banned from Twitch.",
  usage: "#banned <user>",
  run: async function(ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const user = await ivr.getUser(ctx.parameters[0]);
    if (user) {
      if (user.banned === true) {
        return {
          reply: `BOP ${user.displayName} is BANNED. ${user.banReason}`,
        };
      } else {
        return {
          reply: `${user.displayName} is not banned`,
        };
      }
    } else {
      return {
        reply: `User ${ctx.parameters[0]} not found`
      };
    }
  }
};
