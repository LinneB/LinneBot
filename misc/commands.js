const fs = require("fs");
const path = require("path");
const { getConfig } = require("./config");

exports.commands = {};
exports.cooldowns = {};

exports.add = function(command) {
  if (command.name in this.commands) {
    return;
  }
  this.commands[command.name] = command;
};

exports.getCommandByAlias = function(alias) {
  const prefix = getConfig("prefix");
  for (const commandName in this.commands) {
    const command = this.commands[commandName];
    for (const commandAlias of command.aliases) {
      if (prefix + commandAlias === alias.toLowerCase()) {
        return command;
      }
    }
  }
  return null;
};

exports.isOnCooldown = function(userid, command) {
  const currentTime = Date.now();
  if (!this.cooldowns[command.name]) {
    this.cooldowns[command.name] = {};
  }
  if (this.cooldowns[command.name][userid]) {
    if (currentTime - this.cooldowns[command.name][userid] > command.cooldown) {
      this.cooldowns[command.name][userid] = currentTime;
      return true;
    } else {
      return false;
    }
  }
  this.cooldowns[command.name][userid] = currentTime;
  return true;
};

exports.getCommandByName = function(name) {
  for (const commandName in this.commands) {
    const command = this.commands[commandName];
    if (command.name.toLowerCase() === name.toLowerCase()) {
      return command;
    }
  }
  return null;
};

const files = fs.readdirSync(path.join(__dirname, "../commands"))
  .filter(file => file.endsWith(".js"));
for (const file of files) {
  this.add(require(path.join(__dirname, "../commands", file)));
}
