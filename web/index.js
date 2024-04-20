import commands from "../misc/commands.js";
import db from "../providers/postgres.js";
import express from "express";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("web/index");
import path from "node:path";
import tmiClient from "../providers/irc.js";
const __dirname = import.meta.dirname;

const app = express();
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: "info" }));

app.get("/", (_req, res) => {
    const channels = [...tmiClient.joinedChannels];
    res.render("pages/home", {
        channels: channels,
        commands: commands.commands,
    });
});

app.get("/commands", (_req, res) => {
    res.render("pages/commands", {
        commands: commands.commands,
    });
});

app.get("/command/:command", (req, res) => {
    const command = commands.getCommandByName(req.params.command);
    if (!command) {
        res.status(404).render("pages/commandNotFound");
    } else {
        res.render("pages/commandDetails", {
            command: command,
        });
    }
});

app.get("/commands/:channel", async (req, res) => {
    const channel = req.params.channel || "";

    try {
        const chats = await db.pool
            .query(db.queries.SELECT.getChats)
            .then((res) => {
                if (res.rowCount < 1) return [];
                return res.rows.map((row) => row.user_name);
            });

        if (!chats.includes(channel)) {
            res.status(404).render("pages/channelNotFound");
            return;
        }

        const staticCommands = await db.pool
            .query(db.queries.SELECT.getCommands, [channel])
            .then((res) => res.rows);

        res.render("pages/channelCommands", {
            commands: commands.commands,
            staticCommands,
            username: channel,
        });
    } catch (err) {
        logger.error("Could not get commands: ", err);
        res.status(404).render("pages/channelNotFound");
    }
});

app.use("/static", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    logger.info(`Express server started at http://localhost:${port}`);
});

export default app;
