const ivr = require("../providers/ivr");

module.exports = {
  name: "followers",
  aliases: ["followers", "followcount"],
  cooldown: 3000,
  help: "Sends the follower count of a user. Defaults to sender username.",
  usage: "#followers [user]",
  run: async (ctx) => {
    let username = ctx.senderUsername;
    if (ctx.parameters.length > 0) {
      username = ctx.parameters[0];
    }
    const user = await ivr.getUser(username);
    if (user) {
      return {
        reply: `${user.displayName} has ${user.followers.toLocaleString(
          "en-US",
        )} followers`,
      };
    }
    return {
      reply: `User ${username} not found`,
    };
  },
  examples: [
    {
      description: ["Get your own follow count"],
      command: "#followers",
      response: "@LinneB, LinneB has 23 followers",
    },
    {
      description: ["Get Forsen's follow count"],
      command: "#followers forsen",
      response: "@LinneB, forsen has 1,739,372 followers",
    },
  ],
};
