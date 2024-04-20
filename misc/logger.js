import log4js from "log4js";
const logLevel = process.env.LOG_LEVEL || "info";

log4js.configure({
    appenders: {
        console: { type: "stdout" },
    },
    categories: {
        default: { appenders: ["console"], level: logLevel },
    },
});

export default log4js;
