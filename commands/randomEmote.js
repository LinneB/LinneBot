import seventv from "../providers/seventv.js";
import utils from "../misc/utils.js";

export default {
    name: "randomEmote",
    aliases: ["randomemote", "re"],
    cooldown: 3000,
    help: "Gets random emotes from the current channel.",
    usage: "#randomemote [amount]",
    run: async function (ctx) {
        const userid = ctx.roomID;
        const emotes = await seventv.getEmotes(userid);
        if (emotes.length === 0) {
            return {
                reply: "This channel does not have any 7tv emotes",
            };
        }

        let amount = 1;
        if (ctx.parameters.length > 0) {
            amount = Number.parseInt(ctx.parameters[0]);
            if (Number.isNaN(amount)) {
                return {
                    reply: `Amount is not a number. Usage: ${this.usage}`,
                };
            }
            if (amount > 10) {
                return {
                    reply: "Amount can not be higher than 10.",
                };
            }
        }

        let randomEmotes = [];
        utils.randomNumbersUnique(0, emotes.length - 1, amount).map((i) => {
            randomEmotes.push(emotes[i]);
        });

        const actors = new Set();
        randomEmotes.map((emote) => actors.add(emote.actor_id));

        const users = [...actors].map((actor) => seventv.getUser(actor));
        const sevenTVIDs = await Promise.all(users).then((users) => {
            const output = {};
            for (const user of users) {
                output[user.id] = user.display_name;
            }
            return output;
        });

        const response = randomEmotes.map((emote) => {
            const timeAgo = utils.formattedTimeAgoString(
                Date.now() - new Date(emote.timestamp),
            );
            const actor = sevenTVIDs[emote.actor_id];
            if (actor) {
                return `${emote.name} (${actor}: ${
                    timeAgo ? `${timeAgo} ago` : "just now"
                })`;
            }
            return `${emote.name} (${timeAgo ? `${timeAgo} ago` : "just now"})`;
        });

        return {
            reply: response.join(", "),
        };
    },
    examples: [
        {
            description: ["Gets a random emote from the current chat"],
            command: "#randomemote",
            response: "@LinneB, Emiru (linneb: 6 months ago)",
        },
        {
            description: ["Gets 10 random emotes from the current chat"],
            command: "#re 10",
            response:
                "@LinneB, Emiru (linneb: 6 months ago), buh (linneb: 2 months ago)...",
        },
    ],
};
