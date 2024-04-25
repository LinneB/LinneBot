import ivr from "../providers/ivr.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("cmd/seventv");
import seventv from "../providers/seventv.js";

const errors = {
    add: {
        70403: 'Bot does not have permission to manage emotes, make sure the bot has "Modify emotes" in the 7TV editor settings',
        704611: "Could not add emote: Emote already enabled",
        704612: "Could not add emote: Emote name conflict",
        704620: "Could not add emote: Not enough slots in emote set",
    },
    remove: {
        70403: 'Bot does not have permission to manage emotes, make sure the bot has "Modify emotes" in the 7TV editor settings',
    },
    rename: {
        70403: 'Bot does not have permission to manage emotes, make sure the bot has "Modify emotes" in the 7TV editor settings',
        704613: "Could not rename emote: Invalid name",
    },
};

export default {
    name: "seventv",
    aliases: ["seventv", "7tv", "emote"],
    cooldown: 5000,
    help: "Manage 7TV emotes for the current chat. Bot and sender need to be 7TV editors.",
    usage: "#seventv <add|remove|rename|yoink> [args]",
    run: async function (ctx) {
        if (ctx.parameters.length < 1) {
            return { reply: `No subcommand provided. Usage: ${this.usage}` };
        }
        const subCommand = ctx.parameters[0].toLowerCase();
        if (!["add", "remove", "rename", "yoink"].includes(subCommand)) {
            return {
                reply: `Invalid subcommand provided. Usage: ${this.usage}`,
            };
        }

        const [botID, chatUser, senderUser] = await Promise.all([
            // 7TV user ID for token holder
            seventv.getBotID().then((res) => res.data.data?.user?.id),
            // 7TV user ID for current chat
            seventv.getTwitchUser(ctx.roomID),
            // 7TV user ID for sender
            seventv.getTwitchUser(ctx.senderUserID),
        ]);
        if (!botID) {
            return {
                reply: "7TV authentication error, go yell at LinneB to fix their bot >(",
            };
        }
        if (!chatUser) {
            return { reply: "Could not get 7TV profile for the current chat" };
        }
        if (!senderUser) {
            return { reply: "Could not get 7TV profile for sender" };
        }

        // 7TV profile and emote set for current chat
        // This uses GQL to bypass API cache
        const [chatUserGQL, chatEmoteSet] = await Promise.all([
            seventv
                .getUserGQL(chatUser.user.id)
                .then((res) => res.data.data?.user),
            seventv
                .getEmotesGQL(chatUser.emote_set.id)
                .then((res) => res.data.data?.emoteSet),
        ]);

        if (!chatUserGQL) {
            return { reply: "Failed to get 7TV profile for the current chat" };
        }
        if (!chatEmoteSet) {
            return { reply: "Failed to get emote set for current chat" };
        }

        // List of 7TV IDs that are editor for the current chat
        const editors = chatUserGQL.editors
            ? chatUserGQL.editors.map((e) => e.id)
            : [];
        if (!editors.includes(botID)) {
            return {
                reply: 'Bot is not a 7TV editor. Make sure to add it with the "Modify emotes" permission',
            };
        }
        if (!editors.includes(senderUser.user.id)) {
            return { reply: "You are not an editor of the current chat" };
        }

        if (subCommand === "add") {
            if (ctx.parameters.length < 2) {
                return { reply: `No emote URL provided. Usage: ${this.usage}` };
            }
            let targetEmote;
            try {
                const emoteURL = new URL(ctx.parameters[1]);
                const urlParts = emoteURL.pathname.split("/").filter((u) => u);
                if (
                    emoteURL.hostname !== "7tv.app" ||
                    urlParts.length !== 2 ||
                    urlParts[0] !== "emotes" ||
                    urlParts[urlParts.length - 1].length !== 24
                ) {
                    throw Error();
                }

                targetEmote = urlParts[urlParts.length - 1];
            } catch {
                return { reply: `Invalid URL detected. Usage: ${this.usage}` };
            }

            const res = await seventv.addEmote(
                chatUser.emote_set.id,
                targetEmote,
            );
            if (!res.data.errors) {
                const emoteName = res.data.data.emoteSet.emotes.filter(
                    (e) => e.id === targetEmote,
                )[0];
                if (emoteName) {
                    return { reply: `Added emote ${emoteName.name}` };
                }
                return { reply: `Added emote ${targetEmote}` };
            }

            for (const error of res.data.errors) {
                const code = error.extensions.code;
                if (errors.add[code]) {
                    return {
                        reply: errors.add[code],
                    };
                }
                logger.error("Uncaught error from 7TV GQL", error);
            }
        }

        if (subCommand === "remove") {
            if (ctx.parameters.length < 2) {
                return { reply: `No emote provided. Usage: ${this.usage}` };
            }

            const emote = ctx.parameters[1];
            const targetEmote = chatEmoteSet.emotes.filter(
                (e) => e.name === emote,
            )[0];
            if (!targetEmote) {
                return { reply: `Emote ${emote} not found` };
            }

            const res = await seventv.removeEmote(
                chatUser.emote_set.id,
                targetEmote.id,
            );
            if (!res.data.errors) {
                return { reply: `Removed emote ${targetEmote.name}` };
            }

            for (const error of res.data.errors) {
                const code = error.extensions.code;
                if (errors.remove[code]) {
                    return {
                        reply: `${errors.remove[code]}`,
                    };
                }
                logger.error("Uncaught error from 7TV GQL", error);
            }
        }
        if (subCommand === "rename") {
            if (ctx.parameters.length < 3) {
                return {
                    reply: `${
                        ctx.parameters.length < 2
                            ? "No emote provided"
                            : "No new name provided"
                    }. Usage: ${this.usage}`,
                };
            }
            const emote = ctx.parameters[1];
            const newName = ctx.parameters[2];
            const targetEmote = chatEmoteSet.emotes.filter(
                (e) => e.name === emote,
            )[0];
            if (!targetEmote) {
                return { reply: `Emote ${emote} not found` };
            }

            const res = await seventv.renameEmote(
                chatUser.emote_set.id,
                targetEmote.id,
                newName,
            );

            if (!res.data.errors) {
                return { reply: `Renamed ${emote} to ${newName}` };
            }

            for (const error of res.data.errors) {
                const code = error.extensions.code;
                if (errors.rename[code]) {
                    return {
                        reply: `${errors.rename[code]}`,
                    };
                }
                logger.error("Uncaught error from 7TV GQL", error);
            }
        }
        if (subCommand === "yoink") {
            if (ctx.parameters.length < 3) {
                return {
                    reply: `${
                        ctx.parameters.length < 2
                            ? "No emote name provided"
                            : "No channel provided"
                    }. Usage: ${this.usage}`,
                };
            }
            const emote = ctx.parameters[1];
            const channel = ctx.parameters[2].toLowerCase();

            if (channel === ctx.roomName.toLowerCase()) {
                return { reply: "You can't steal from yourself!" };
            }

            const channelID = await ivr.usernameToID(channel);
            if (!channelID) {
                return { reply: `User ${channel} not found` };
            }

            const channelEmoteSet = await seventv.getEmotes(channelID);

            const targetEmote = channelEmoteSet.filter(
                (e) => emote === e.name,
            )[0];
            if (!targetEmote) {
                return {
                    reply: `User ${channel} doesn't have any emotes named ${emote}`,
                };
            }

            const res = await seventv.addEmoteWithName(
                chatUser.emote_set.id,
                targetEmote.id,
                targetEmote.name,
            );
            if (!res.data.errors) {
                return {
                    reply: `Added emote ${targetEmote.name} from ${channel}`,
                };
            }

            for (const error of res.data.errors) {
                const code = error.extensions.code;
                if (errors.add[code]) {
                    return {
                        reply: `${errors.add[code]}`,
                    };
                }
                logger.error("Uncaught error from 7TV GQL", error);
            }
        }
    },
    examples: [
        {
            description: ['Remove "buh" from the current chat'],
            command: "#7tv remove buh",
            response: "@linneb, Removed emote buh",
        },
        {
            description: [
                "Add an emote with a link",
                "Note that this URL needs to be a proper 7tv.app URL including https://",
            ],
            command: "#7tv add https://7tv.app/emotes/63cec0c12ba67946677a463e",
            response: "@linneb, Added emote buh",
        },
        {
            description: [
                'Steal the emote named "buh" from PSP1G\'s chat and add it to the current chat',
            ],
            command: "#7tv yoink buh psp1g",
            response: "@linneb, Added emote buh from psp1g",
        },
        {
            description: ['Rename the emote named "buh" to "boh"'],
            command: "#7tv rename buh boh",
            response: "@linneb, Renamed buh to boh",
        },
    ],
};
