const express = require("express");
const morgan = require("morgan");
const path = require("path");
const { getConfig } = require("../misc/config");
const { log } = require("../misc/utils");
const commands = require("../misc/commands");
const webConfig = getConfig("web");
const port = webConfig["port"] || 8080;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(morgan(':req[x-real-ip] - [:date] ":method :url HTTP/:http-version" STATUS :status  ":referrer" ":user-agent"')); // eslint-disable-line quotes

app.get("/", (req, res) => {
  res.render("home", {
    channels: getConfig("channels"),
    commands: commands.commands,
  });
});
app.get("/commands", (req, res) => {
  res.render("commands", {
    commands: commands.commands,
  });
});
app.get("/commands/:command", (req, res) => {
  const command = commands.getCommandByName(req.params.command);
  if (!command) {
    res.status(404).render("commandNotFound");
  } else {
    res.render("commandDetails", {
      command: command,
    });
  }
});

app.use("/static", express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  log("info", `Express server started at http://localhost:${port}`);
});

module.exports = {
  expressApp: app,
};
