const ivr = require("../providers/ivr");

module.exports = {
  name: "userinfo",
  aliases: ["#userinfo", "#info", "#id"],
  cooldown: 3000,
  help: "Gets some information about a user.",
  usage: "#userinfo <user>",
  run: async function(ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const user = await ivr.getUser(ctx.parameters[0]);
    if (user) {
      return {
        reply: `Username: ${user.displayName} | User ID: ${user.id} | Description: ${user.bio} | Followers: ${user.followers}`,
      };
    } else {
      return {
        reply: `User ${ctx.parameters[0]} not found`
      };
    }
  }
};
