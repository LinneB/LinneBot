import commands from "./commands.js";
import express from "express";
import log4js from "./logger.js";
const logger = log4js.getLogger("commandServer");

const app = express();
const port = process.env.DEBUG_PORT || 3030;

app.use(express.json());
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: "debug" }));

app.post("/run", async (req, res) => {
    const expectedCtx = [
        "broadcaster",
        "senderUsername",
        "admin",
        "roomID",
        "blacklist",
        "senderDisplayName",
        "roomName",
        "senderUserID",
        "message",
        "isMod",
        "prefix",
    ];
    try {
        const ctx = req.body;
        for (const option of expectedCtx) {
            if (ctx[option] === undefined) {
                res.status(400).send({ error: `Missing ${option}` });
                return;
            }
        }
        ctx.args = ctx.message.split(" ").filter((c) => c.trim());
        ctx.parameters = ctx.args.slice(1);
        ctx.command = ctx.args[0].slice(ctx.prefix.length);

        if (!ctx.message.startsWith(ctx.prefix)) {
            res.status(404).send({
                error: "No command detected",
            });
            return;
        }

        const command = commands.getCommandByAlias(ctx.command);
        if (!command) {
            res.status(404).send({
                error: "No command detected",
            });
            return;
        }
        logger.info(`Running command ${command.name}`);

        const curTime = Date.now();
        const result = await command.run(ctx);
        if (result?.reply) {
            res.status(200).send({
                reply: result.reply,
                time: Date.now() - curTime
            });
            return;
        }
        res.status(505).send({
            error: "Command returned null",
        });
    } catch (e) {
        logger.error(e);
        res.status(500).send({});
    }
});

if (process.env.DEBUG_SERVER) {
    logger.warn(
        "Enabling debug command control server. !! THIS SHOULD NEVER BE ENABLED OUTSIDE OF DEVELOPMENT !!",
    );
    app.listen(port, () =>
        logger.warn(
            `Debug command control server listening on http://localhost:${port}`,
        ),
    );
}
