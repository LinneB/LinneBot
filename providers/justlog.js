import AXIOS from "axios";

const axios = AXIOS.create({
    baseURL: "https://logs.ivr.fi",
    validateStatus: false,
    headers: {
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
});

export default axios;
