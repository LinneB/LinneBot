const db = require("../providers/postgres");
const commands = require("../misc/commands");
const logger = require("../misc/logger").getLogger("cmd/cmd");
const { getConfig } = require("../misc/config");

module.exports = {
  name: "cmd",
  cooldown: 1000,
  aliases: ["command", "cmd"],
  help: "Adds/removes commands from the current chat. Mod required.",
  usage: "#cmd <add|remove> <name> [reply]",
  run: async function (ctx) {
    if (!ctx.isMod && !ctx.broadcaster && ctx.senderUsername !== "linneb") {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`,
      };
    }
    if (ctx.parameters[0] === "add") {
      if (ctx.parameters.length < 3) {
        return {
          reply: `Usage: ${this.usage}`,
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

      const prefix = getConfig("prefix");
      if (commands.getCommandByAlias(prefix + commandName)) {
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
};
