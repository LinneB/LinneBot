const axios = require("axios");
const logger = require("../misc/logger").getLogger("ivr");

exports.axios = axios.create({
  baseURL: "https://api.ivr.fi/v2",
  validateStatus: false,
});

exports.getUser = async function (username) {
  const res = await this.axios({
    method: "get",
    url: `/twitch/user?login=${username}`,
  });
  if (res.status === 200) {
    if (res.data.length > 0) {
      return res.data[0];
    }
    return null;
  }
  logger.error(`IVR returned unexpected status code ${res.status}`);
};

exports.getUserID = async function (userid) {
  const res = await this.axios({
    method: "get",
    url: `/twitch/user?id=${userid}`,
  });
  if (res.status === 200) {
    if (res.data.length > 0) {
      return res.data[0];
    }
    return null;
  }
  logger.error(`IVR returned unexpected status code ${res.status}`);
};

exports.usernameToID = async function (username) {
  const user = await this.getUser(username);
  if (user) {
    return user.id;
  }
  return null;
};

exports.IDtoUsername = async function (userid) {
  const user = await this.getUserID(userid);
  if (user) {
    return user.login;
  }
  return null;
};

exports.subAge = async function (username, channel) {
  return this.axios({
    method: "get",
    url: `/twitch/subage/${username}/${channel}`,
  });
};
