import ivr from "../providers/ivr.js";

export default {
    name: "userinfo",
    aliases: ["userinfo", "info", "id"],
    cooldown: 3000,
    help: "Gets some information about a user.",
    usage: "#userinfo <user>",
    run: async function (ctx) {
        if (ctx.parameters.length < 1) {
            return {
                reply: `No username provided. Usage: ${this.usage}`,
            };
        }
        const user = await ivr.getUser(ctx.parameters[0]);
        if (user) {
            return {
                reply: `Username: ${user.displayName} | User ID: ${user.id} | Description: ${user.bio} | Followers: ${user.followers}`,
            };
        }
        return {
            reply: `User ${ctx.parameters[0]} not found`,
        };
    },
    examples: [
        {
            description: ["Get some information about a user"],
            command: "#userinfo linneb",
            response:
                "@LinneB, Username: LinneB | User ID: 215185844 | Description: buh | Followers: 23",
        },
    ],
};
