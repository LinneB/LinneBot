import commands from "../misc/commands.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("interceptor/command");

async function interceptor(ctx) {
    const command = commands.getCommandByAlias(ctx.command);
    if (!command) return;
    if (commands.isOnCooldown(ctx.senderUserID, command)) return;
    logger.info("Executing command", command.name);
    const currentTime = Date.now();
    try {
        const result = await command.run(ctx);
        if (!result) {
            logger.error("Command execution returned null value");
        }
        if (result.reply) {
            logger.debug(
                `Command executed successfully, took ${Date.now() - currentTime}ms`,
            );
            return result.reply;
        }
    } catch (err) {
        logger.error("Command execution threw error!", err);
    }
}

export default interceptor;
