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
    if (!ctx.broadcaster && !ctx.admin) return;

    if (ctx.command === "join") {
      if (!ctx.admin) return;
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

    if (ctx.command === "part") {
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

      if (ctx.admin) {
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
  examples: [
    {
      description: [
        "Leaves the current channel. Broadcaster required.",
        "<b>THIS WILL DELETE ALL COMMANDS, LIVE NOTIFICATIONS, AND OTHER SETTINGS PERMANENTLY</b>",
      ],
      command: "#part",
      response:
        'This command will leave this chat and DELETE ALL commands and ALL live notifications PERMANENTLY. Use "#part --confirm" to confirm.',
    },
    {
      description: [],
      command: "#part --confirm",
      response: "Until we meet again. Parting channel...",
    },
    {
      description: [
        "If you are an admin, you can use this to join and part any channel",
      ],
      command: "#join linneb",
      response: "@LinneB, Joining channel linneb",
    },
    {
      description: [],
      command: "#part linneb",
      response: "@LinneB, Parting channel linneb",
    },
  ],
};
