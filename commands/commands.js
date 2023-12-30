module.exports = {
  name: "commands",
  aliases: ["commands"],
  cooldown: 1000,
  help: "Sends the list of enabled commands in the current channel.",
  usage: "#commands",
  run: (ctx) => ({
    reply: `List of commands: https://bot.linneb.xyz/commands/${ctx.roomName}`,
  }),
};
