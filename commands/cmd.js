const db = require("../providers/postgres");
const commands = require("../misc/commands");
const logger = require("../misc/logger").getLogger("cmd/cmd");

module.exports = {
  name: "cmd",
  cooldown: 1000,
  aliases: ["command", "cmd"],
  help: "Adds/removes commands from the current chat. Mod required.",
  usage: "#cmd <add|remove> <name> [reply]",
  run: async function (ctx) {
    if (!ctx.isMod && !ctx.broadcaster && !ctx.admin) {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `${
          ctx.parameters.length < 1
            ? "No subcommand provided"
            : "No command name provided"
        }. Usage: ${this.usage}`,
      };
    }
    if (ctx.parameters[0] === "add") {
      if (ctx.parameters.length < 3) {
        return {
          reply: `No reply provided. Usage: ${this.usage}`,
        };
      }
      const commandName = ctx.parameters[1].toLowerCase();
      const commandReply = ctx.parameters.slice(2).join(" ");
      if (commandName.length > 50) {
        return {
          reply: "Command names can only be 50 characters WTRuck",
        };
      }
      if (commandReply.length > 400) {
        return {
          reply: "Command replies can only be 400 characters WTRuck",
        };
      }

      const res = await db.pool.query(db.queries.SELECT.getCommand, [
        ctx.roomID,
        commandName,
      ]);
      if (res.rowCount > 0) {
        return {
          reply: `${commandName} is already a command`,
        };
      }

      if (commands.getCommandByAlias(commandName)) {
        return {
          reply: `${commandName} is already a command`,
        };
      }

      logger.info(
        `Adding command ${commandName} (issued by ${ctx.senderUsername})`,
      );
      await db.pool
        .query(db.queries.INSERT.addCommand, [
          ctx.roomID,
          commandName,
          commandReply,
        ])
        .catch((err) => {
          logger.error("Could not add command: ", err);
        });
      return {
        reply: `Added command ${commandName}`,
      };
    }
    if (ctx.parameters[0] === "remove") {
      const commandName = ctx.parameters[1].toLowerCase();
      const res = await db.pool.query(db.queries.SELECT.getCommand, [
        ctx.roomID,
        commandName,
      ]);
      if (res.rowCount < 1) {
        return {
          reply: `${commandName} is not a command`,
        };
      }

      logger.info(
        `Removing command ${commandName} (issued by ${ctx.senderUsername})`,
      );
      db.pool
        .query(db.queries.DELETE.deleteCommand, [ctx.roomID, commandName])
        .catch((err) => {
          logger.error("Could not delete command: ", err);
        });
      return {
        reply: `Removed command ${commandName}`,
      };
    }
  },
  examples: [
    {
      description: ['Adds a command named "test"'],
      command: "#cmd add test This is a brand new command!",
      response: "@LinneB, Added command test",
    },
    {
      description: ["You can now use this command in the current chat"],
      command: "#test",
      response: "@LinneB, This is a brand new command!",
    },
    {
      description: ["Removing a command is basically the same"],
      command: "#cmd remove test",
      response: "@LinneB, Removed command test",
    },
  ],
};
