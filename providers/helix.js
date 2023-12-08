const axios = require("axios");
const { log } = require("../misc/utils");

exports.axios = axios.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    "Client-ID": process.env.CLIENT_ID,
    "Authorization": `Bearer ${process.env.USER_TOKEN}`,
  },
  validateStatus: false,
});

// Invalid token handler
this.axios.interceptors.response.use(
  async (response) => {
    if (response.status === 401) {
      if (await this.validateToken(process.env.USER_TOKEN)) {
        log("error", "Helix returned 401 but user token is valid");
        return response;
      } else {
        log("fatal", "Invalid user token");
        process.exit(1);
      }
    } else {
      return response;
    }
  },
  (err) => err,
);

exports.channelsToID = async function(channels) {
  try {
    const res = await this.axios({
      method: "get",
      url: "/users?login=" + channels.join("&login="),
    });
    if (!res || res?.data?.data?.length < 1) {
      return [];
    } else {
      return res.data.data.map((user) => user.id);
    }
  } catch (err) {
    log("error", err);
    return [];
  }
};

exports.validateToken = async function(token) {
  try {
    const res = await this.axios({
      baseURL: "https://id.twitch.tv/oauth2/validate",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-ID": process.env.CLIENT_ID,
      }
    });
    if (res.status === 200) {
      const expire_date = new Date(Date.now() + (res.data["expires_in"] * 1000));
      log("info", `Token is valid, token expires on ${expire_date.toLocaleString("sv-SE")}`);
      return true;
    }
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        return false;
      } else {
        log("error", `Token validation responded with unexpected status code ${err.response.status}: ${err.response}`);
      }
    }
  }
};

setInterval(async () => {
  log("info", "Validating token...");
  if (!await this.validateToken(process.env.USER_TOKEN)) {
    log("fatal", "Invalid user token");
    process.exit(0);
  }
}, 1 * 3600 * 1000);
