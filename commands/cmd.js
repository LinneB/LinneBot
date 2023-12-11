const mongodb = require("../providers/mongodb");
const { getCommandByAlias } = require("../misc/commands");
const { log } = require("../misc/utils");

module.exports = {
  name: "cmd",
  cooldown: 1000,
  aliases: ["#command", "#cmd"],
  help: "Adds/removes commands from the current chat. Mod required.",
  usage: "#cmd <add|remove> <name> [reply]",
  run: async function(ctx) {
    if (!ctx.isMod && !ctx.broadcaster && ctx.senderUsername !== "linneb") {
      return;
    }
    if (ctx.parameters.length < 2) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    if (ctx.parameters[0] === "add") {
      if (ctx.parameters.length < 3) {
        return {
          reply: `Usage: ${this.usage}`
        };
      }
      const commandName = ctx.parameters[1].toLowerCase();
      const commandReply = ctx.parameters.slice(2).join(" ");
      if (commandName.length > 50) {
        return {
          reply: "Command names can only be 50 characters WTRuck"
        };
      }
      if (commandReply.length > 400) {
        return {
          reply: "Command replies can only be 400 characters WTRuck"
        };
      }
      const data = await mongodb.getChannelData(ctx.roomName);
      for (const command of data.commands) {
        if (command.name === ctx.parameters[1]) {
          return {
            reply: `${command.name} is already a command`
          };
        }
      }
      if (getCommandByAlias(`#${commandName}`)) {
        return {
          reply: `${commandName} is already a command`
        };
      }
      log("info", `Adding command ${commandName} (issued by ${ctx.senderUsername})`);
      data.commands.push({
        name: commandName,
        reply: commandReply
      });
      data.save();
      return {
        reply: `Added command ${commandName}`
      };
    } else if (ctx.parameters[0] === "remove") {
      const commandName = ctx.parameters[1].toLowerCase();
      const data = await mongodb.getChannelData(ctx.roomName);
      for (const command of data.commands) {
        if (command.name !== commandName) {
          continue;
        }
        log("info", `Removing command ${commandName} (issued by ${ctx.senderUsername})`);
        data.commands = data.commands.filter(cmd => cmd.name !== commandName);
        data.save();
        return {
          reply: `Removed command ${commandName}`
        };
      }
      return {
        reply: `Command ${commandName} not found`
      };
    }
  }
};
