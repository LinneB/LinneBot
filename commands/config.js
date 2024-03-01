const db = require("../providers/postgres");
const logger = require("../misc/logger").getLogger("cmd/config");

module.exports = {
  name: "config",
  aliases: ["config", "set"],
  cooldown: 1000,
  help: "Change bot settings.",
  usage: "#config <option> [args]",
  run: async function (ctx) {
    if (!ctx.broadcaster && !ctx.admin) {
      logger.debug("Not admin or broadcaster");
      return;
    }
    if (ctx.parameters.length < 1) {
      return {
        reply: `No option provided. Usage: ${this.usage}`,
      };
    }

    const option = ctx.parameters[0];
    switch (option) {
      case "prefix": {
        if (ctx.parameters.length < 2) {
          const chat = await db.pool
            .query({
              text: db.queries.SELECT.getChat,
              values: [ctx.roomID],
            })
            .then((res) => {
              return res.rows[0] || null;
            });
          if (!chat) {
            logger.error("Could not get chat from database");
            return;
          }
          const prefix = chat.prefix;
          return {
            reply: `Current command prefix is "${prefix}"`,
          };
        }

        let prefix = ctx.parameters[1];
        if (prefix === "default") {
          prefix = "#";
        }
        if (prefix.length > 2) {
          return {
            reply: "Command prefix can only be 2 characters",
          };
        }

        await db.pool.query({
          text: db.queries.UPDATE.updatePrefix,
          values: [ctx.roomID, prefix],
        });
        return {
          reply: `Changed command prefix to "${prefix}"`,
        };
      }
      default: {
        break;
      }
    }
  },
  examples: [
    {
      description: ["Get the current command prefix"],
      command: "#config prefix",
      response: '@LinneB, Current command prefix is "#"',
    },
    {
      description: ['Change the command prefix to "|"'],
      command: "#config prefix |",
      response: '@LinneB, Changed command prefix to "|"',
    },
    {
      description: ["Change it back to the default"],
      command: "#config prefix default",
      response: '@LinneB, Changed command prefix to "#"',
    },
  ],
};
