const db = require("../providers/postgres");
const ivr = require("../providers/ivr");
const tmiClient = require("../providers/irc");
const logger = require("../misc/logger").getLogger("cmd/join");

module.exports = {
  name: "join",
  aliases: ["join", "part"],
  cooldown: 5000,
  help: "Joins/parts channels. Broadcaster or admin required.",
  usage: "#<join|part> [args]",
  run: async (ctx) => {
    if (!ctx.broadcaster && ctx.senderUsername !== "linneb") return;

    const command = ctx.command.slice(1);
    if (command === "join") {
      if (ctx.senderUsername !== "linneb") return;
      if (ctx.parameters.length < 1) {
        return {
          reply: "No channel provided",
        };
      }

      const channel = ctx.parameters[0].toLowerCase();
      const userid = await ivr.usernameToID(channel);
      if (!userid) {
        return {
          reply: `User ${channel} not found`,
        };
      }

      logger.info(`Joining channel ${channel}`);
      db.pool
        .query(db.queries.INSERT.addChat, [userid, channel])
        .then(() => {
          tmiClient.join(channel);
        })
        .catch((err) => {
          logger.error("Could not add chat: ", err);
        });

      return {
        reply: `Joining channel ${channel}`,
      };
    }

    if (command === "part") {
      if (ctx.broadcaster) {
        if (ctx.parameters.length < 1) {
          return {
            reply: `This command will leave this chat and DELETE ALL commands and ALL live notifications PERMANENTLY. Use "${ctx.command} --confirm" to confirm.`,
          };
        }
        if (ctx.parameters[0] !== "--confirm") return;

        const userid = ctx.roomID;
        logger.info(`Parting channel ${ctx.roomName}`);
        db.pool
          .query({
            text: db.queries.DELETE.deleteChat,
            values: [userid],
          })
          .then(() => {
            tmiClient.part(channel);
          })
          .catch((err) => {
            logger.error(err);
          });

        return {
          reply: "Until we meet again. Parting channel...",
        };
      }

      if (ctx.senderUsername === "linneb") {
        if (ctx.parameters.length < 1) {
          return {
            reply: "No channel provided",
          };
        }

        const channel = ctx.parameters[0].toLowerCase();
        const userid = await ivr.usernameToID(channel);
        if (!userid) {
          return {
            reply: `User ${channel} not found`,
          };
        }

        logger.info(`Parting channel ${channel}`);
        db.pool
          .query({
            text: db.queries.DELETE.deleteChat,
            values: [userid],
          })
          .then(() => {
            tmiClient.part(channel);
          })
          .catch((err) => {
            logger.error(err);
          });

        return {
          reply: `Parting channel ${channel}`,
        };
      }
    }
  },
};
