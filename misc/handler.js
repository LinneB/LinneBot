const tmiClient = require("../providers/irc");
const helix = require("../providers/helix");
const commands = require("../misc/commands");
const mongodb = require("../providers/mongodb");
const { getConfig } = require("../misc/config");
const { log, makeStreamOnlineMessages } = require("../misc/utils");

function buildMessageContext(msg) {
  const args = msg.messageText.split(" ").filter((c) => c.trim());
  const command = args[0].toLowerCase();

  return {
    message: msg.messageText,
    senderUsername: msg.senderUsername,
    senderDisplayName: msg.displayName,
    senderUserID: msg.senderUserID,
    args: args,
    command: command,
    parameters: args.slice(1),
    broadcaster: msg.senderUserID === msg.channelID,
    roomID: msg.channelID,
    roomName: msg.channelName,
    isMod: msg.isMod,
    ircMsg: msg,
  };
}

exports.onChat = async (msg) => {
  const prefix = getConfig("prefix");
  const ctx = buildMessageContext(msg);
  if (!ctx.command.startsWith(prefix)) {
    return;
  }
  // Interactive command
  const command = commands.getCommandByAlias(ctx.command);
  if (command) {
    if (commands.isOnCooldown(ctx.senderUserID, command)) {
      log("info", `Executing ${command.name}`);
      const result = await command.run(ctx);
      if (result?.reply) {
        tmiClient.sendMessage(
          ctx.roomName,
          `@${ctx.senderDisplayName}, ${result.reply}`,
        );
      }
    }
  }
  // Static command
  const channelData = await mongodb.getChannelData(ctx.roomName);
  for (const command of channelData.commands) {
    if (command.name !== ctx.command.slice(1)) {
      continue;
    }
    if (commands.isOnCooldown(ctx.senderUserID, command)) {
      log("info", `Executing ${command.name}`);
      tmiClient.sendMessage(
        ctx.roomName,
        `@${ctx.senderDisplayName}, ${command.reply}`,
      );
    }
  }
};

exports.onReady = () => log("info", "Connected to twitch");

exports.streamOnline = async (event) => {
  const channels = getConfig("channels");
  const streamUsername = event.broadcaster_user_login.toLowerCase();
  const streamUserID = event.broadcaster_user_id;

  const subscribedChats = {};
  const channelsData = await mongodb.ChannelModel.find({
    channel: { $in: channels },
  });
  for (const channelData of channelsData) {
    for (const sub of channelData.subscriptions) {
      if (sub.channel === streamUsername) {
        subscribedChats[channelData.channel] = sub.subscribers;
      }
    }
  }

  const res = await helix.axios({
    method: "get",
    url: `/channels?broadcaster_id=${streamUserID}`,
  });
  if (res.status === 200) {
    const { game_name, title } = res.data.data[0];
    const streamMessage = `https://twitch.tv/${streamUsername} just went live playing ${game_name}! ${title}`;
    for (const [chat, subs] of Object.entries(subscribedChats)) {
      const messages = makeStreamOnlineMessages(streamMessage, subs);
      for (const message of messages) {
        tmiClient.sendMessage(chat, message);
      }
    }
  } else {
    log("error", `Helix returned unexpected status code ${res.status}`);
    const streamMessage = `https://twitch.tv/${streamUsername} just went live!`;
    for (const [chat, subs] of Object.entries(subscribedChats)) {
      const messages = makeStreamOnlineMessages(streamMessage, subs);
      for (const message of messages) {
        tmiClient.sendMessage(chat, message);
      }
    }
  }
};
