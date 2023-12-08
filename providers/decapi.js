const axios = require("axios");

exports.axios = axios.create({
  baseURL: "https://decapi.me",
  validateStatus: false,
});
