const tmiClient = require("../providers/irc");

module.exports = {
  name: "ping",
  cooldown: 1000,
  aliases: ["ping", "uptime"],
  help: "Sends uptime and chat information.",
  usage: "#ping",
  run: async () => {
    // Uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    let formattedUptime = "";
    if (hours > 0) {
      formattedUptime += `${hours}h `;
    }
    if (minutes > 0) {
      formattedUptime += `${minutes}m `;
    }
    formattedUptime += `${seconds}s`;

    // Channels
    const channels = [...tmiClient.joinedChannels].length;

    // Chat latency
    const currentTime = Date.now();
    await tmiClient.ping();
    const latency = Date.now() - currentTime;

    return {
      reply: `Pong! Bot has been up for ${formattedUptime}. Latency to chat: ${latency}ms. Currently in ${channels} ${
        channels > 1 ? "channels" : "channel"
      }`,
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
