const axios = require("axios");
const utils = require("../misc/utils");

exports.axios = axios.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    "Client-ID": process.env.CLIENT_ID,
    Authorization: `Bearer ${process.env.USER_TOKEN}`,
  },
  validateStatus: false,
});

// Invalid token handler
this.axios.interceptors.response.use(
  async (response) => {
    if (response.status === 401) {
      if (await this.validateToken(process.env.USER_TOKEN)) {
        utils.log("error", "Helix returned 401 but user token is valid");
        return response;
      }
      log("fatal", "Invalid user token");
      process.exit(1);
    } else {
      return response;
    }
  },
  (err) => err,
);

exports.channelsToID = async function (channels) {
  try {
    const res = await this.axios({
      method: "get",
      url: `/users?login=${channels.join("&login=")}`,
    });
    if (!res || res?.data?.data?.length < 1) {
      return [];
    }
    return res.data.data.map((user) => user.id);
  } catch (err) {
    utils.log("error", err);
    return [];
  }
};

exports.validateToken = async (token) => {
  const res = await axios({
    baseURL: "https://id.twitch.tv/oauth2/validate",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-ID": process.env.CLIENT_ID,
    },
    validateStatus: false,
  });
  if (res.status === 200) {
    const expire_date = new Date(Date.now() + (res.data.expires_in * 1000));
    const expires_in = utils.formattedTimeAgoString(res.data.expires_in * 1000);
    utils.log("info", `User token is valid, expires on ${expire_date.toLocaleString("sv-SE")} (${expires_in})`);
    return true;
  }
  if (res.status === 401) {
    return false;
  }
  utils.log("error", `Token validation responded with unexpected status code ${res.status}`);
};

setInterval(async () => {
  utils.log("info", "Validating token...");
  if (!await this.validateToken(process.env.USER_TOKEN)) {
    utils.log("fatal", "Invalid user token");
    process.exit(1);
  }
}, 1 * 3600 * 1000);
