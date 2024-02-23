module.exports = {
  name: "github",
  aliases: ["github"],
  cooldown: 1000,
  help: "Sends the link to the LinneBot GitHub repository",
  usage: "#github",
  run: () => ({
    reply: "https://github.com/LinneB/LinneBot",
  }),
  examples: [
    {
      description: ["Self explanatory"],
      command: "#github",
      response: "@LinneB, https://github.com/LinneB/LinneBot",
    },
  ],
};
