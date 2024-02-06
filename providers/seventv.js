const axios = require("axios");
const logger = require("../misc/logger").getLogger("7tv");

exports.axios = axios.create({
  baseURL: "https://7tv.io/v3",
  validateStatus: false,
});

exports.getEmoteSet = async function (userid) {
  const res = await this.axios({
    method: "get",
    url: `/users/twitch/${userid}`,
  });
  if (res.status === 200) {
    return res.data.emote_set.emotes;
  }
  if (res.status === 404) {
    return [];
  }
  logger.error(`7TV returned unexpected status code ${res.status}`);
  return [];
};
