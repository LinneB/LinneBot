const chalk = require("chalk");

exports.timeDifference = function (ms) {
  const date = new Date(ms);
  return {
    years: date.getUTCFullYear() - 1970,
    months: date.getUTCMonth(),
    days: date.getUTCDate() - 1,
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
  };
};

exports.formattedTimeAgoString = function(dur) {
  const { years, months, days, hours, minutes, seconds } = this.timeDifference(dur);
  if (years > 0) {
    return `${years} ${years > 1 ? "years" : "year"}`;
  } else if (months > 0) {
    return `${months} ${months > 1 ? "months" : "month"}`;
  } else if (days > 0) {
    return `${days} ${days > 1 ? "days" : "day"}`;
  } else if (hours > 0) {
    return `${hours} ${hours > 1 ? "hours" : "hour"}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes > 1 ? "minutes" : "minute"}`;
  } else if (seconds > 0) {
    return `${seconds} ${seconds > 1 ? "seconds" : "second"}`;
  } else {
    return null;
  }
};

exports.log = function(level, ...message) {
  const date = new Date().toLocaleString("sv-SE");
  if (level === "debug") {
    console.log(`[${date}] ${chalk.gray("DEBUG")}: ${message.join(" ")}`);
  } else if (level === "info") {
    console.log(`[${date}] ${chalk.green("INFO")}: ${message.join(" ")}`);
  } else if (level === "warn") {
    console.log(`[${date}] ${chalk.yellow("WARN")}: ${message.join(" ")}`);
  } else if (level === "error") {
    console.log(`[${date}] ${chalk.red("ERROR")}: ${message.join(" ")}`);
  } else if (level === "fatal") {
    console.log(`[${date}] ${chalk.bgRed("FATAL")}: ${message.join(" ")}`);
  }
};

exports.truncateString = function(input, length) {
  if (input.length > length) {
    return length > 3
      ? input.slice(0, length - 3) + "..."
      : "...";
  } else {
    return input;
  }
};

exports.randomNumber = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.randomElementInArray = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

exports.makeStreamOnlineMessages = function(streamMessage, users) {
  const messages = [];
  let buf = streamMessage;
  for (const user of users) {
    const combinedMessage = `${buf} ${user}`;
    if (combinedMessage.length > 450) {
      messages.push(buf.trim());
      buf = user;
    } else {
      buf = `${buf} ${user}`;
    }
  }
  messages.push(buf.trim());
  return messages;
};
