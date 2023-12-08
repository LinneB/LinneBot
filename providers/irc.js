const { ChatClient } = require("dank-twitch-irc");
const { log, truncateString } = require("../misc/utils");

const tmiClient = new ChatClient({
  username: process.env.BOT_USERNAME,
  password: `oauth:${process.env.USER_TOKEN}`
});

tmiClient.sendMessage = function(channel, message) {
  if (!channel || !message) {
    return;
  }
  message = truncateString(message, 450);
  log("info", `Sending message in #${channel}: "${message}"`);
  this.say(channel, message);
};

module.exports = tmiClient;
