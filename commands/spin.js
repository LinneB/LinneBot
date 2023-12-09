const { randomElementInArray } = require("../misc/utils");
module.exports = {
  name: "spin",
  aliases: ["#spin", "!spin"],
  cooldown: 1000,
  help: "Totally not a clone of another streamers command.",
  usage: "!spin",
  run: function() {
    const fruits = ["🍋", "🍋", "🍋", "🍒", "🍒", "🍇", "🍇", "🥒", "🥒", "📖"];
    const result = Array.from({ length: 3 }, () => randomElementInArray(fruits)).join(" ");
    return {
      reply: result
    };
  }
};
