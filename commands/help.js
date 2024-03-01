const commands = require("../misc/commands");
const db = require("../providers/postgres");

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

    const chat = db.pool
      .query({
        text: db.queries.SELECT.getChat,
        values: [ctx.roomID],
      })
      .then((res) => res.rows[0]);

    const prefix = chat.prefix;
    const search = ctx.parameters[0].startsWith(prefix)
      ? ctx.parameters[0].slice(prefix.length)
      : ctx.parameters[0];

    const command = commands.getCommandByAlias(search);
    if (command) {
      return {
        reply: `${command.help} Aliases: [${command.aliases.join(
          ", ",
        )}]. Usage: ${
          command.usage
        }. More information: https://bot.linneb.xyz/command/${command.name}`,
      };
    }
    return {
      reply: `Command not found. For a full list of commands see https://bot.linneb.xyz/commands/${ctx.roomName}`,
    };
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
