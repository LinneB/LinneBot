const tmiClient = require("../providers/irc");
const helix = require("../providers/helix");
const commands = require("../misc/commands");
const { getConfig } = require("../misc/config");
const { log, truncateString } = require("../misc/utils");

function buildMessageContext(msg) {
  const args = msg.messageText.split(" ");
  const command = args[0].toLowerCase();

  return {
    message: msg.messageText,
    senderUsername: msg.senderUsername,
    senderDisplayName: msg.displayName,
    senderUserID: msg.senderUserID,
    args: args,
    command: command,
    parameters: args.slice(1),
    broadcaster: (msg.senderUserID === msg.channelID),
    roomID: msg.channelID,
    roomName: msg.channelName,
    isMod: msg.isMod,
    ircMsg: msg,
  };
}

exports.onChat = async function(msg) {
  const ctx = buildMessageContext(msg);
  const command = commands.getCommandByAlias(ctx.command);
  if (command) {
    if (commands.isOnCooldown(ctx.senderUserID, command)) {
      log("info", "Executing " + command.name);
      const result = await command.run(ctx);
      if (result?.reply) {
        tmiClient.sendMessage(ctx.roomName, `@${ctx.senderDisplayName}, ${result.reply}`);
      }
    }
  }
};
exports.onReady = () => log("info", "Connected to twitch");
exports.streamOnline  = async function(event) {
  const livenotif = getConfig("livenotif");
  const users = livenotif[event.broadcaster_user_login.toLowerCase()];
  const res = await helix.axios({
    method: "get",
    url: "/channels?broadcaster_id=" + event.broadcaster_user_id,
  });
  if (res.status === 200) {
    const { game_name, title } = res.data.data[0];
    const message = `${users.join(", ")} https://twitch.tv/${event.broadcaster_user_login} just went live playing ${game_name}! ${title}`;
    tmiClient.sendMessage(getConfig("channelToNotify"), truncateString(message, 400));
  } else {
    log("error", `Helix returned unexpected status code ${res.status}`);
    const message = `https://twitch.tv/${event.broadcaster_user_login} just went live! ${users.join(", ")}`;
    tmiClient.sendMessage(getConfig("channelToNotify"), truncateString(message, 400));
  }
};
