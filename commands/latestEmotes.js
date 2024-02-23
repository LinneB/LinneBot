const seventv = require("../providers/seventv");
const ivr = require("../providers/ivr");
const utils = require("../misc/utils");

module.exports = {
  name: "latestEmotes",
  aliases: ["latestemotes", "le"],
  cooldown: 3000,
  help: "Sends the 5 most recent 7TV emotes in a given channel. Defaults to current chat.",
  usage: "#latestemotes [user]",
  run: async (ctx) => {
    let userid = ctx.roomID;
    if (ctx.parameters.length > 0) {
      const channel = ctx.parameters[0];
      userid = await ivr.usernameToID(channel);
      if (!userid) {
        return {
          reply: `User ${channel} not found`,
        };
      }
    }
    const emotes = await seventv
      .getEmoteSet(userid)
      .then((emotes) => emotes.slice(-5));
    if (emotes.length === 0) {
      return {
        reply: "This channel does not have any 7tv emotes",
      };
    }

    const actors = new Set();
    emotes.map((emote) => actors.add(emote.actor_id));

    const requests = [...actors].map((actor) => {
      return seventv.axios({
        method: "get",
        url: `/users/${actor}`,
      });
    });
    const sevenTVIDs = await Promise.all(requests).then((responses) => {
      const output = {};
      for (const res of responses) {
        output[res.data.id] = res.data.display_name;
      }
      return output;
    });

    const latestEmotes = emotes.map((emote) => {
      const timeAgo = utils.formattedTimeAgoString(
        Date.now() - new Date(emote.timestamp),
      );
      const actor = sevenTVIDs[emote.actor_id];
      if (actor) {
        return `${emote.name} (added by ${actor} ${
          timeAgo ? `${timeAgo} ago` : "just now"
        })`;
      }
      return `${emote.name} (${timeAgo ? `${timeAgo} ago` : "just now"})`;
    });

    return {
      reply: latestEmotes.reverse().join(", "),
    };
  },
};
