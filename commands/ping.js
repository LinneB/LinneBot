import irc from "../providers/irc.js";
import utils from "../misc/utils.js";

export default {
    name: "ping",
    aliases: ["ping", "uptime"],
    cooldown: 1000,
    help: "Checks if the bot is alive, and returns some relevant information.",
    usage: "#ping",
    run: async () => {
        const uptime = process.uptime();
        const formattedUptime = utils.formattedTimeAgoString(uptime * 1000);

        const currentTime = Date.now();
        await irc.ping();
        const latency = `${Date.now() - currentTime}ms`;
        return {
            reply: `Pong! Bot has been up for ${formattedUptime}. Latency: ${latency}`,
        };
    },
    examples: [
        {
            description: ["Get uptime and bot information"],
            command: "#ping",
            response:
                "@LinneB, Pong! Bot has been up for 2m 50s. Latency to chat: 193ms. Currently in 2 channels",
        },
    ],
};
