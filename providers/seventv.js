import AXIOS from "axios";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("7tv");

export const axios = AXIOS.create({
    baseURL: "https://7tv.io/v3",
    validateStatus: false,
    headers: {
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
});

export async function getEmoteSet(userid) {
    const res = await axios({
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
}

export default {
    axios,
    getEmoteSet,
};
