import AXIOS from "axios";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("ivr");

const axios = AXIOS.create({
    baseURL: "https://api.ivr.fi/v2",
    validateStatus: false,
    headers: {
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
});

async function getUser(username) {
    const res = await axios({
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
}

async function getUserID(userid) {
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
}

async function usernameToID(username) {
    const user = await this.getUser(username);
    if (user) {
        return user.id;
    }
    return null;
}

async function IDtoUsername(userid) {
    const user = await this.getUserID(userid);
    if (user) {
        return user.login;
    }
    return null;
}

export default {
    axios,
    getUser,
    getUserID,
    usernameToID,
    IDtoUsername,
};
