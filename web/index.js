const express = require("express");
const morgan = require("morgan");
const path = require("path");
const { getConfig } = require("../misc/config");
const { log } = require("../misc/utils");
const commands = require("../misc/commands");
const mongodb = require("../providers/mongodb");
const ivr = require("../providers/ivr");
const port = getConfig("port") || 8080;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(morgan("short"));

app.get("/", (req, res) => {
  res.render("pages/home", {
    channels: getConfig("channels"),
    commands: commands.commands,
  });
});

app.get("/commands", (req, res) => {
  res.render("pages/commands", {
    commands: commands.commands,
  });
});

app.get("/command/:command", (req, res) => {
  const command = commands.getCommandByName(req.params.command);
  if (!command) {
    res.status(404).render("pages/commandNotFound");
  } else {
    res.render("pages/commandDetails", {
      command: command,
    });
  }
});

app.get("/commands/:channel", async (req, res) => {
  const channel = req.params.channel || "";
  if (!getConfig("channels").includes(channel.toLowerCase())) {
    res.status(404).render("pages/channelNotFound");
    return;
  }
  const channelData = await mongodb.ChannelModel.findOne({ channel: channel });
  if (!channelData) {
    res.status(404).render("pages/channelNotFound");
    return;
  }
  const channelInfo = await ivr.getUser(channel);
  res.render("pages/channelCommands", {
    commands: commands.commands,
    staticCommands: channelData.commands,
    username: channel,
    profilePicURL: channelInfo.logo,
  });
});

app.use("/static", express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  log("info", `Express server started at http://localhost:${port}`);
});

module.exports = {
  expressApp: app,
};
