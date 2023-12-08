const axios = require("axios");

exports.axios = axios.create({
  baseURL: "https://logs.ivr.fi",
  validateStatus: false,
});
