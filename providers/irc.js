import { ChatClient } from "dank-twitch-irc";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("irc");
import { truncateString } from "../misc/utils.js";

export const tmi = new ChatClient({
    username: process.env.BOT_USERNAME,
    password: `oauth:${process.env.USER_TOKEN}`,
});

// Wrapper function around tmi.say with message trimming and logging
tmi.sendMessage = (channel, message) => {
    if (!channel || !message) {
        return;
    }
    const trimmedMessage = truncateString(message, 450);
    logger.info(`Sending message in #${channel}: "${trimmedMessage}"`);
    tmi.say(channel, trimmedMessage);
};

export default tmi;
