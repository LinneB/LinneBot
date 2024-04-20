import helix from "../providers/helix.js";
import ivr from "../providers/ivr.js";

export default {
    name: "clear",
    aliases: ["clear", "1984"],
    cooldown: 1000,
    help: "Deletes chat. Mod required.",
    usage: "#clear",
    run: async (ctx) => {
        if (!ctx.isMod && !ctx.broadcaster && !ctx.admin) {
            return {};
        }
        const botUserID = await ivr.usernameToID(process.env.BOT_USERNAME);
        if (!botUserID) {
            return;
        }
        const requests = [];
        for (let i = 0; i < 500; i++) {
            requests.push(
                helix.axios({
                    method: "delete",
                    url: `/moderation/chat?broadcaster_id=${ctx.roomID}&moderator_id=${botUserID}`,
                }),
            );
        }
        const responses = await Promise.all(requests);
        if (responses.some((res) => res.status === 403)) {
            return {
                reply: "I need to be a moderator to clear chat WTRuck",
            };
        }
    },
    examples: [
        {
            description: ["Clears chat 500 times"],
            command: "#clear",
            response: "Chat has been cleared by a moderator.",
        },
    ],
};
