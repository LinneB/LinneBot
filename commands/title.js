import helix from "../providers/helix.js";
import ivr from "../providers/ivr.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("cmd/title");

export default {
    name: "title",
    aliases: ["title"],
    cooldown: 3000,
    help: "Sends the title of a channel. Defaults to current chat.",
    usage: "#title [channel]",
    run: async (ctx) => {
        let userid = ctx.roomID;
        if (ctx.parameters.length > 0) {
            userid = await ivr.usernameToID(ctx.parameters[0]);
            if (!userid) {
                return {
                    reply: `User ${ctx.parameters[0]} not found`,
                };
            }
        }
        const res = await helix.axios({
            method: "get",
            url: `/channels?broadcaster_id=${userid}`,
        });
        if (res.status === 200) {
            const { title, broadcaster_name } = res.data.data[0];
            return {
                reply: `${broadcaster_name}'s title is: ${title}`,
            };
        }
        logger.error(`Helix returned unexpected status code ${res.status}`);
    },
    examples: [
        {
            description: ["Get the current chats title"],
            command: "#title",
            response:
                "@LinneB, LinneB's title is: gaycatwithsweetbabysrayhoneymustart",
        },
        {
            description: ["Get forsens current title"],
            command: "#title forsen",
            response:
                "@LinneB, forsen's title is: Blind playthrough! Permadeath! Hard difficulty!",
        },
    ],
};
