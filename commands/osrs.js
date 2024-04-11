function getExperienceForLevel(level) {
  let points = 0;
  let output = 0;
  for (let lvl = 1; lvl <= level; lvl++) {
    points += Math.floor(lvl + 300.0 * 2.0 ** (lvl / 7.0));
    if (lvl >= level) {
      return output;
    }
    output = Math.floor(points / 4);
  }
  return 0;
}

function getLevelForExperience(xp) {
  let level = 0;
  for (let i = 1; i <= 99; i++) {
    const levelXP = getExperienceForLevel(i);
    if (levelXP > xp) {
      return level;
    }
    level = i;
  }
  return level;
}

module.exports = {
  name: "osrs",
  cooldown: 1000,
  aliases: ["osrs", "runescape"],
  help: "Utility command for Old School Runescape.",
  usage: "#osrs <progress|tax> [args]",
  run: function (ctx) {
    if (ctx.parameters.length < 1) {
      return {
        reply: `No subcommand provided. Usage ${this.usage}`,
      };
    }
    const subCommand = ctx.parameters[0];
    switch (subCommand) {
      case "progress": {
        if (ctx.parameters.length < 2) {
          return {
            reply: `No input provided. Usage ${this.usage}`,
          };
        }

        const input = Number.parseInt(ctx.parameters[1]);
        if (Number.isNaN(input)) {
          return {
            reply: `Input is not a number. Usage: ${this.usage}`,
          };
        }

        const maxXP = getExperienceForLevel(99);
        const inputLevel = getLevelForExperience(input);
        const inputXP = getExperienceForLevel(input);

        if (input >= maxXP) {
          return {
            reply: "You are already level 99",
          };
        }
        if (input < 1) {
          return {
            reply: `You can't have less than 1 xp`,
          };
        }
        if (input <= 99) {
          const progress = `${((inputXP / maxXP) * 100).toFixed(2)}%`;
          return {
            reply: `Level ${input} (${inputXP.toLocaleString(
              "en-US",
            )} xp) is ${progress} of level 99 (${maxXP.toLocaleString(
              "en-US",
            )} xp)`,
          };
        }
        const progress = `${((input / maxXP) * 100).toFixed(2)}%`;
        return {
          reply: `${input.toLocaleString(
            "en-US",
          )} xp (level ${inputLevel}) is ${progress} of level 99 (${maxXP.toLocaleString(
            "en-US",
          )} xp)`,
        };
      }
      case "tax": {
        if (ctx.parameters.length < 2) {
          return {
            reply: `No input provided. Usage ${this.usage}`,
          };
        }

        const input = Number.parseInt(ctx.parameters[1]);
        if (Number.isNaN(input)) {
          return {
            reply: `Input is not a number. Usage: ${this.usage}`,
          };
        }
        if (input >= 2 ** 32 / 2) {
          return {
            reply: `The max GE sell price is ${(2 ** 32 / 2).toLocaleString(
              "en-US",
            )}gp.`,
          };
        }

        const maxTax = 5000000;
        const tax = Math.min(Math.floor(input / 100), maxTax);
        const finalPrice = input - tax;
        return {
          reply: `${finalPrice.toLocaleString("en-US")} (${input.toLocaleString(
            "en-US",
          )} - ${tax.toLocaleString("en-US")})`,
        };
      }
      default: {
        return {
          reply: `Invalid subcommand provided. Usage: ${this.usage}`,
        };
      }
    }
  },
  examples: [
    {
      description: ["Check your progress to level 99"],
      command: "#osrs progress 40",
      response:
        "@LinneB, Level 40 (37,224 xp) is 0.29% of level 99 (13,034,431 xp)",
    },
    {
      description: [
        "If the input is higher than 99, it is treated as an XP value",
      ],
      command: "#osrs progress 200000",
      response:
        "@LinneB, 200,000 xp (level 56) is 1.53% of level 99 (13,034,431 xp)",
    },
    {
      description: ["Get the GE tax when selling an item for 10,000gp"],
      command: "#osrs tax 10000",
      response: "@LinneB, 9,900 (10,000 - 100)",
    },
  ],
};
