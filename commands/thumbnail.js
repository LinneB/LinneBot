import helix from "../providers/helix.js";
import ivr from "../providers/ivr.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("cmd/thumbnail");

export default {
    name: "thumbnail",
    aliases: ["thumbnail"],
    cooldown: 3000,
    help: "Gets the thumbnail of a stream.",
    usage: "#thumbnail <channel>",
    run: async function (ctx) {
        if (ctx.parameters.length < 1) {
            return {
                reply: `No channel provided. Usage: ${this.usage}`,
            };
        }
        const channel = ctx.parameters[0];
        const userid = await ivr.usernameToID(channel);
        if (!userid) {
            return {
                reply: `User ${channel} not found`,
            };
        }
        const res = await helix.axios({
            method: "get",
            url: `/streams?user_id=${userid}`,
        });
        if (res.status === 200) {
            const data = res.data.data;
            if (data.length < 1) {
                return {
                    reply: `${ctx.parameters[0]} is offline`,
                };
            }
            const link = data[0].thumbnail_url.replace(
                /\{width\}x\{height\}/g,
                "1920x1080",
            );
            return {
                reply: link,
            };
        }
        logger.error(`Helix returned unexpected status code ${res.status}`);
    },
    examples: [
        {
            description: ["Get forsens current thumbnail"],
            command: "#thumbnail forsen",
            response:
                "@LinneB, https://static-cdn.jtvnw.net/previews-ttv/live_user_forsen-1920x1080.jpg",
        },
    ],
};
