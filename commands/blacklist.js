const db = require("../providers/postgres");
const commands = require("../misc/commands");
const logger = require("../misc/logger").getLogger("cmd/blacklist");

module.exports = {
  name: "blacklist",
  aliases: ["blacklist"],
  cooldown: 1000,
  help: "Add/remove commands from chat blacklist. Mod required.",
  usage: "#blacklist <add|remove> <command>",
  run: async function (ctx) {
    if (!ctx.mod && !ctx.broadcaster && !ctx.admin) {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `${
          ctx.parameters.length < 1
            ? "No subcommand provided"
            : "No command provided"
        }. Usage: ${this.usage}`,
      };
    }

    const subCommand = ctx.parameters[0].toLowerCase();
    const command = ctx.parameters[1].toLowerCase();
    if (!["add", "remove"].includes(subCommand)) {
      return {
        reply: `Invalid subcommand provided. Usage: ${this.usage}`,
      };
    }

    const chat = await db.pool
      .query({
        text: db.queries.SELECT.getChat,
        values: [ctx.roomID],
      })
      .then((res) => res.rows[0])
      .catch((e) => {
        logger.error(e);
      });

    const search = command.startsWith(chat.prefix)
      ? command.slice(chat.prefix.length)
      : command;
    const cmd = commands.getCommandByAlias(search);
    if (!cmd) {
      return {
        reply: `Invalid command provided. Usage: ${this.usage}`,
      };
    }

    if (subCommand === "add") {
      if (chat.blacklist.includes(cmd.name)) {
        return {
          reply: `${cmd.name} is already blacklisted.`,
        };
      }

      chat.blacklist.push(cmd.name);
      const blacklist = JSON.stringify(chat.blacklist);
      db.pool
        .query({
          text: db.queries.UPDATE.updateBlacklist,
          values: [ctx.roomID, blacklist],
        })
        .catch((e) => {
          logger.error(e);
        });
      return {
        reply: `Added ${cmd.name} to command blacklist`,
      };
    }
    if (subCommand === "remove") {
      if (!chat.blacklist.includes(cmd.name)) {
        return {
          reply: `${cmd.name} is not blacklisted.`,
        };
      }

      const blacklist = chat.blacklist.filter((c) => c !== cmd.name);
      db.pool
        .query({
          text: db.queries.UPDATE.updateBlacklist,
          values: [ctx.roomID, JSON.stringify(blacklist)],
        })
        .catch((e) => {
          logger.error(e);
        });
      return {
        reply: `Removed ${cmd.name} from command blacklist`,
      };
    }
  },
  examples: [
    {
      description: ["Add live the command blacklist"],
      command: "#blacklist add live",
      response: "@LinneB, Added live to command blacklist",
    },
  ],
};
