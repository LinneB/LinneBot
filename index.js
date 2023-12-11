require("dotenv").config();
const { log } = require("./misc/utils");
const { getConfig } = require("./misc/config");
const tmiClient = require("./providers/irc");
const { onChat, onReady } = require("./misc/handler");

require("./web");
require("./misc/commands");

(async () => {
  log("info", "Connecting to chat...");
  tmiClient.on("PRIVMSG", onChat);
  tmiClient.on("ready", onReady);
  tmiClient.connect();
  tmiClient.joinAll(getConfig("channels"));
  log("info", "Initializing EventSub...");
  require("./providers/eventsub");
  log("info", "Initializing database...");
  require("./providers/mongodb");
})();

// This signal handler is required for Node to shut down properly when running in Docker
process.on("SIGTERM", () => {
  log("info", "Exiting...");
  process.exit(0);
});
