import { randomElementInArray } from "../misc/utils.js";

export default {
    name: "spin",
    aliases: ["spin"],
    cooldown: 1000,
    help: "Totally not a clone of another streamers command.",
    usage: "#spin",
    run: () => {
        const fruits = [
            "🍋",
            "🍋",
            "🍋",
            "🍒",
            "🍒",
            "🍇",
            "🍇",
            "🥒",
            "🥒",
            "📖",
        ];
        const result = Array.from({ length: 3 }, () =>
            randomElementInArray(fruits),
        ).join(" ");
        return {
            reply: result,
        };
    },
    examples: [
        {
            description: ["Spin the wheel"],
            command: "#spin",
            response: "@LinneB, 🍒 🍒 🥒",
        },
    ],
};
