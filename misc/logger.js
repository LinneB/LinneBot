const log4js = require("log4js");
const config = require("../config.json");
const logLevel = config.logLevel || "info";

log4js.configure({
  appenders: {
    console: { type: "stdout" },
  },
  categories: {
    default: { appenders: ["console"], level: logLevel },
  },
});

module.exports = log4js;
