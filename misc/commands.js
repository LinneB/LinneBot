import fs from "node:fs";
import log4js from "./logger.js";
const logger = log4js.getLogger("commands");
import path from "node:path";
const __dirname = import.meta.dirname;

export const commands = {};
const cooldowns = {};

// Somehow this block allows commands/help.js to import commands
(async () => {
    const files = fs
        .readdirSync(path.join(__dirname, "../commands"))
        .filter((file) => file.endsWith(".js"));

    logger.debug(`Loading ${files.length} command files`);
    for (const file of files) {
        const commandPath = path.join("../commands", file);
        const command = await import(commandPath).then((c) => c.default);
        commands[command.name] = command;
    }
    logger.debug("Finished loading commands");
})();

export function getCommandByAlias(alias) {
    for (const command of Object.values(commands)) {
        for (const commandAlias of command.aliases) {
            if (commandAlias === alias.toLowerCase()) {
                return command;
            }
        }
    }
    return null;
}

export function getCommandByName(name) {
    for (const command of Object.values(commands)) {
        if (command.name.toLowerCase() === name.toLowerCase()) {
            return command;
        }
    }
    return null;
}

export function isOnCooldown(userid, command) {
    const curTime = Date.now();
    const { name, cooldown } = command;
    if (!cooldowns[name]) {
        cooldowns[name] = {};
    }
    if (cooldowns[name][userid]) {
        if (curTime - cooldowns[name][userid] > cooldown) {
            // User waited out the cooldown period
            cooldowns[name][userid] = curTime;
            return false;
        }
        // User is still on cooldown
        return true;
    }
    // First time executing command
    cooldowns[name][userid] = curTime;
    return false;
}

export default {
    commands,
    getCommandByAlias,
    getCommandByName,
    isOnCooldown,
};
