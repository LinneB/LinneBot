const commands = require("../misc/commands");

module.exports = {
  name: "help",
  aliases: ["help", "usage"],
  cooldown: 1000,
  help: "Sends info and usage of a command.",
  usage: "#help <command>",
  run: (ctx) => {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: #help <command>. For a full list of commands see https://bot.linneb.xyz/commands/${ctx.roomName}`,
      };
    }
    const search = ctx.parameters[0].startsWith("#")
      ? ctx.parameters[0]
      : `#${ctx.parameters[0]}`;
    const command = commands.getCommandByAlias(search);
    if (command) {
      return {
        reply: `${command.help} Aliases: [${command.aliases.join(
          ", ",
        )}]. Usage: ${command.usage}`,
      };
    }
  },
  examples: [
    {
      description: ["Sends usage and channel commands"],
      command: "#help",
      response:
        "@LinneB, Usage: #help <command>. For a full list of commands see https://bot.linneb.xyz/commands/linneb",
    },
    {
      description: ['Get information about the "live" command'],
      command: "#help live",
      response:
        "@LinneB, Sends information about a stream. Aliases: [live, stream]. Usage: #live <user>",
    },
  ],
};
