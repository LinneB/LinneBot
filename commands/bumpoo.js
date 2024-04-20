import justlog from "../providers/justlog.js";

export default {
    name: "bumpoo",
    aliases: ["bumpoo"],
    cooldown: 1000,
    help: "Gets a random bumpoo27 log from sennyk4's chat.",
    usage: "#bumpoo",
    run: async () => {
        const res = await justlog({
            method: "get",
            url: "/channel/sennyk4/user/bumpoo27/random?jsonBasic=true",
        });
        if (res.status === 200) {
            return {
                reply: res.data.messages[0].text,
            };
        }
    },
    examples: [
        {
            description: [
                'Get a random bumpoo27 log from <a class="hyperlink" href="https://logs.ivr.fi">logs.ivr.fi</a>',
            ],
            command: "#bumpoo",
            response:
                "@LinneB, you’re name is chance?! where’d senny come from then dude?!",
        },
        {
            description: [""],
            command: "#bumpoo",
            response:
                "@LinneB, hey dude! dropped ya a follow back on your twitch page here! just know you're messin with the wrong guy! arghhhh!",
        },
        {
            description: [""],
            command: "#bumpoo",
            response:
                "@LinneB, he acts so sassy when he's not in the top right corner of the screen huh?!",
        },
    ],
};
