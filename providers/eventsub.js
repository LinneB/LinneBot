const TES = require("tesjs");
const { log } = require("../misc/utils");
const ivr = require("./ivr");
const { getConfig } = require("../misc/config");
const { expressApp } = require("../web");
const { streamOnline } = require("../misc/handler");

const tes = new TES({
  identity: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  listener: {
    type: "webhook",
    baseURL: process.env.BASE_URL,
    secret: process.env.WEBHOOK_SECRET,
    server: expressApp,
    port: getConfig("web")["port"],
  },
  options: { debug: getConfig("debug") || false }
});

tes.on("stream.online", streamOnline);

(async () => {
  const livenotif = getConfig("livenotif");
  const res = await ivr.axios({
    method: "get",
    url: `/twitch/user?login=${Object.keys(livenotif).join("%2C")}`
  });
  const channels = res.data.map(user => user.id);
  if (channels.length != Object.keys(livenotif).length) {
    log("error", "Could not get userID for one or more channels in livenotif");
    process.exit(0);
  }
  log("info", `Subscribing to ${channels.length} ${channels.length > 1 ? "channels" : "channel"}`);
  for (const channel of channels) {
    tes.subscribe("stream.online", {
      broadcaster_user_id: channel
    }).then(() => {
      log("INFO", `Created subscribtion for ${channel}`);
    }).catch((err) => {
      log("warn", err);
    });
  }
})();

module.exports = tes;
