module.exports = {
  name: "github",
  aliases: ["github"],
  cooldown: 1000,
  help: "Sends the link to the LinneBot GitHub repository",
  usage: "#github",
  run: function() {
    return {
      reply: "https://github.com/LinneB/LinneBot"
    };
  }
};
