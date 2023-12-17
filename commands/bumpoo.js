const justlog = require("../providers/justlog");

module.exports = {
  name: "bumpoo",
  aliases: ["bumpoo"],
  cooldown: 1000,
  help: "Gets a random bumpoo27 log from sennyk4's chat.",
  usage: "#bumpoo",
  run: async function() {
    const res = await justlog.axios({
      method: "get",
      url: "/channel/sennyk4/user/bumpoo27/random?jsonBasic=true",
    });
    if (res.status === 200) {
      return {
        reply: res.data.messages[0].text
      };
    }
  }
};
