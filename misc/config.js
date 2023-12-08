const fs = require("fs");
const { log } = require("./utils");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

function writeConfig() {
  try {
    fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
  } catch (err) {
    log("error", "Could not write config.json file:", err);
  }
}

exports.getConfig = function(key) {
  return config[key];
};

exports.setConfig = function(key, value) {
  config[key] = value;
  writeConfig();
};
