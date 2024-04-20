import seventv from "../providers/seventv.js";
import utils from "../misc/utils.js";

export default {
    name: "randomEmote",
    aliases: ["randomemote", "re"],
    cooldown: 3000,
    help: "Sends a random emote from the current channel.",
    usage: "#randomemote",
    run: async (ctx) => {
        const userid = ctx.roomID;
        const emotes = await seventv.getEmoteSet(userid);
        if (emotes.length === 0) {
            return {
                reply: "This channel does not have any 7tv emotes",
            };
        }
        const emote = utils.randomElementInArray(emotes);
        const timeAgo = utils.formattedTimeAgoString(
            Date.now() - new Date(emote.timestamp),
        );

        const actor = await seventv
            .axios({
                method: "get",
                url: `/users/${emote.actor_id}`,
            })
            .then((res) => res.data.display_name);

        if (actor) {
            return {
                reply: `${emote.name} (added by ${actor} ${
                    timeAgo ? `${timeAgo} ago` : "just now"
                })`,
            };
        }
        return {
            reply: `${emote.name} (${timeAgo ? `${timeAgo} ago` : "just now"})`,
        };
    },
    examples: [
        {
            description: ["Gets a random emote from the current chat"],
            command: "#randomemote",
            response: "@LinneB, Emiru (added by linneb 6 months ago)",
        },
    ],
};
