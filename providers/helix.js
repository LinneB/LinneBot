import AXIOS from "axios";
import { formattedTimeAgoString } from "../misc/utils.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("helix");

export const axios = AXIOS.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${process.env.USER_TOKEN}`,
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
    validateStatus: false,
});

// Invalid token handler
axios.interceptors.response.use(
    async (response) => {
        if (response.status !== 401) return response;
        if (await validateToken()) {
            logger.error("Helix returned 401 but user token is valid");
            return response;
        }
        logger.fatal("Invalid user token");
        process.exit(1);
    },
    (err) => err,
);

export async function validateToken() {
    const res = await axios({
        baseURL: "https://id.twitch.tv/oauth2/validate",
        method: "get",
        validateStatus: false,
    });
    if (res.status === 200) {
        const expiresIn = res.data.expires_in;
        const expireDate = new Date(
            Date.now() + expiresIn * 1000,
        ).toLocaleString("sv-SE");
        const expiresInString = formattedTimeAgoString(expiresIn * 1000);
        logger.info(
            `User token is valid, expires on ${expireDate} (${expiresInString})`,
        );
        return true;
    }
    if (res.status === 401) {
        return false;
    }
    logger.error(
        `Token validation responded with unexpected status code ${res.status}`,
    );
}

// Validate token every hour
setInterval(async () => {
    logger.info("Validating token...");
    if (await validateToken()) return;

    logger.fatal("Invalid user token");
    process.exit(1);
}, 3600 * 1000);

export default {
    axios,
    validateToken,
};
