import db from "../providers/postgres.js";
import { isOnCooldown } from "../misc/commands.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("interceptor/staticCommand");

async function interceptor(ctx) {
    const result = await db.pool.query(db.queries.SELECT.getCommand, [
        ctx.roomID,
        ctx.command,
    ]);
    if (result.rowCount < 1) return;

    const staticCommand = result.rows[0];
    if (isOnCooldown(ctx.senderUserID, staticCommand)) return;

    logger.info(`Executing ${staticCommand.name}`);
    return staticCommand.reply;
}

export default interceptor;
