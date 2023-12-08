const axios = require("axios");
const { log } = require("../misc/utils");

exports.axios = axios.create({
  baseURL: "https://7tv.io/v3",
  validateStatus: false,
});

exports.getEmoteSet = async function(userid) {
  const res = await this.axios({
    method: "get",
    url: "/users/twitch/" + userid
  });
  if (res.status === 200) {
    return res.data.emote_set.emotes;
  } else if (res.status === 404) {
    return [];
  } else {
    log("error", `7TV returned unexpected status code ${res.status}`);
    return [];
  }
};
