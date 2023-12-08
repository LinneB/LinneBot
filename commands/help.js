const commands = require("../misc/commands");

module.exports = {
  name: "help",
  aliases: ["#help", "#usage", "#commands"],
  cooldown: 1000,
  help: "Sends info and usage of a command.",
  usage: "#help <command>",
  run: (ctx) => {
    if (ctx.parameters.length < 1) {
      return {
        reply: "Usage: #help <command>. For a full list of commands see https://bot.linneb.xyz/commands"
      };
    }
    const search = ctx.parameters[0].startsWith("#") ? ctx.parameters[0] : "#" + ctx.parameters[0];
    const command = commands.getCommandByAlias(search);
    if (command) {
      return {
        reply: `${command.help} Aliases: [${command.aliases.join(", ")}]. Usage: ${command.usage}`
      };
    }
  }
};
