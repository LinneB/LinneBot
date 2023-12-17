const ivr = require("../providers/ivr");

module.exports = {
  name: "followers",
  aliases: ["followers", "followcount"],
  cooldown: 3000,
  help: "Sends the follower count of a user. Defaults to sender username.",
  usage: "#followers [user]",
  run: async function(ctx) {
    let username = ctx.senderUsername;
    if (ctx.parameters.length > 0) {
      username = ctx.parameters[0];
    }
    const user = await ivr.getUser(username);
    if (user) {
      return {
        reply: `${user.displayName} has ${user.followers.toLocaleString("en-US")} followers`,
      };
    } else {
      return {
        reply: `User ${username} not found`,
      };
    }
  }
};
