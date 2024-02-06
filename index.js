require("dotenv").config();
const { log } = require("./misc/utils");
const helix = require("./providers/helix");
const { onChat, onReady, streamOnline } = require("./misc/handler");
const tmiClient = require("./providers/irc");
const tes = require("./providers/eventsub");

async function start() {
  log("info", "Validating user token");
  if (!(await helix.validateToken(process.env.USER_TOKEN))) {
    log("fatal", "Invalid user token");
    process.exit(1);
  }

  log("info", "Connecting to chat...");
  tmiClient.on("PRIVMSG", onChat);
  tmiClient.on("ready", onReady);
  tmiClient.connect();

  tes.on("stream.online", streamOnline);
}

start();

// This signal handler is required for Node to shut down properly when running in Docker
process.on("SIGTERM", () => {
  log("info", "Exiting...");
  process.exit(0);
});
