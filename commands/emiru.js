const decapi = require("../providers/decapi");

module.exports = {
  name: "emiru",
  aliases: ["emiru"],
  cooldown: 5000,
  help: "Sends the latest emiru youtube video.",
  usage: "#emiru",
  run: async () => {
    const res = await decapi.axios({
      method: "get",
      url: "/youtube/latest_video?id=UCZprw7Bxzfh2IysXNnl1S3g",
    });
    if (res.status === 200) {
      return {
        reply: res.data,
      };
    }
  },
  examples: [
    {
      description: ["Sends the latest emiru youtube video"],
      command: "#emiru",
      response:
        "@LinneB, Emiru Admits To Being A Furry - https://youtu.be/4e-0NhgcFUc",
    },
  ],
};
