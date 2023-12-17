module.exports = {
  name: "temperature",
  cooldown: 1000,
  aliases: ["ctof", "ftoc"],
  help: "Converts temperature.",
  usage: "#ctof <temperature>",
  run: function(ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    const input = parseFloat(ctx.parameters[0]);
    if (isNaN(input)) {
      return {
        reply: `Usage: ${this.usage}`
      };
    }
    if (input > Number.MAX_SAFE_INTEGER || input < Number.MIN_SAFE_INTEGER) {
      return {
        reply: "That number is too big WTRuck"
      };
    }
    if (ctx.command === "#ctof") {
      const temp_c = input;
      const temp_f = ( temp_c * 9 / 5) + 32;
      return {
        reply: `${temp_c.toLocaleString("en-US")}°C is ${temp_f.toLocaleString("en-US")}°F`
      };
    } else if (ctx.command === "#ftoc") {
      const temp_f = input;
      const temp_c = ( temp_f - 32) * 5 / 9;
      return {
        reply: `${temp_f.toLocaleString("en-US")}°F is ${temp_c.toLocaleString("en-US")}°C`
      };
    }
  }
};
