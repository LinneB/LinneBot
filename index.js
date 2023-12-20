require("dotenv").config();
const { log } = require("./misc/utils");
const { getConfig } = require("./misc/config");
const tmiClient = require("./providers/irc");
const { onChat, onReady } = require("./misc/handler");

log("info", "Connecting to chat...");
tmiClient.on("PRIVMSG", onChat);
tmiClient.on("ready", onReady);
tmiClient.connect();
const channels = getConfig("channels");
log("info", `Joining ${channels.length} ${channels.length > 1 ? "chats" : "chat"}`);
tmiClient.joinAll(getConfig("channels"));

log("info", "Initializing EventSub...");
require("./providers/eventsub");

log("info", "Initializing database...");
require("./providers/mongodb");

// This signal handler is required for Node to shut down properly when running in Docker
process.on("SIGTERM", () => {
  log("info", "Exiting...");
  process.exit(0);
});
