require("dotenv").config();
const { log } = require("./misc/utils");
const { getConfig } = require("./misc/config");
const helix = require("./providers/helix");
const { onChat, onReady, streamOnline } = require("./misc/handler");
require("./providers/mongodb");

async function start() {
  log("info", "Validating user token");
  if (!(await helix.validateToken(process.env.USER_TOKEN))) {
    log("fatal", "Invalid user token");
    process.exit(1);
  }

  log("info", "Connecting to chat...");
  const tmiClient = require("./providers/irc");
  tmiClient.on("PRIVMSG", onChat);
  tmiClient.on("ready", onReady);
  tmiClient.connect();
  const channels = getConfig("channels");
  log(
    "info",
    `Joining ${channels.length} ${channels.length > 1 ? "chats" : "chat"}`,
  );
  tmiClient.joinAll(getConfig("channels"));

  log("info", "Initializing EventSub...");
  const tes = require("./providers/eventsub");
  tes.on("stream.online", streamOnline);
}

start();

// This signal handler is required for Node to shut down properly when running in Docker
process.on("SIGTERM", () => {
  log("info", "Exiting...");
  process.exit(0);
});
