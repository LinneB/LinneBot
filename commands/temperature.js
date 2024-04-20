const format = (num) => {
    return num.toLocaleString("en-US");
};

export default {
    name: "temperature",
    cooldown: 1000,
    aliases: ["ctof", "ftoc"],
    help: "Converts temperature.",
    usage: "#ctof <temperature>",
    run: function (ctx) {
        if (ctx.parameters.length < 1) {
            return {
                reply: `No temperature provided. Usage: ${this.usage}`,
            };
        }
        const input = Number.parseFloat(ctx.parameters[0]);
        if (Number.isNaN(input)) {
            return {
                reply: `Temperature is not a number. Usage: ${this.usage}`,
            };
        }
        if (
            input > Number.MAX_SAFE_INTEGER ||
            input < Number.MIN_SAFE_INTEGER
        ) {
            return {
                reply: "That number is too big WTRuck",
            };
        }
        if (ctx.command === "ctof") {
            const temp_c = input;
            const temp_f = (temp_c * 9) / 5 + 32;
            return {
                reply: `${format(temp_c)}°C is ${format(temp_f)}°F`,
            };
        }
        if (ctx.command === "ftoc") {
            const temp_f = input;
            const temp_c = ((temp_f - 32) * 5) / 9;
            return {
                reply: `${format(temp_f)}°F is ${format(temp_c)}°C`,
            };
        }
    },
    examples: [
        {
            description: ["Convert 70F to real units"],
            command: "#ftoc 70",
            response: "@LinneB, 70°F is 21.111°C",
        },
        {
            description: ["Convert 20.5C to freedom units"],
            command: "#ctof 20.5",
            response: "@LinneB, 20.5°C is 68.9°F",
        },
        {
            description: [
                "Convert the temperature of the suns core to freedom units",
            ],
            command: "#ctof 15000000",
            response: "@LinneB, 15,000,000°C is 27,000,032°F",
        },
    ],
};
