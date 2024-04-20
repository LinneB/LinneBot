import TES from "tesjs";
import db from "./postgres.js";
import expressApp from "../web/index.js";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("eventsub");

const tes = new TES({
    identity: {
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
    },
    listener: {
        type: "webhook",
        baseURL: process.env.BASE_URL,
        secret: process.env.WEBHOOK_SECRET,
        server: expressApp,
        port: process.env.PORT || 8080,
    },
});

// Creates subscription for multiple `userids` if none exists
tes.subscribeIfNot = async function (userIDs = []) {
    const subscriptions = await this.getSubscriptionsByStatus("enabled");
    const subscribedIDs = subscriptions.data.map(
        (sub) => sub.condition.broadcaster_user_id,
    );
    for (const userid of userIDs) {
        if (subscribedIDs.includes(userid)) {
            logger.debug(`Subscription for ${userid} already exists, skipping`);
            return;
        }
        tes.subscribe("stream.online", { broadcaster_user_id: userid })
            .then(() => {
                logger.debug(`Subscription created for ${userid}`);
            })
            .catch((err) => {
                logger.error(`Could not subscribe to ${userid}`, err);
            });
    }
};

// Removes subscriptions that are not used by any chat
tes.unsubscribeUnused = async function () {
    const subscribedIDs = await db.pool
        .query(db.queries.SELECT.getSubscriptions)
        .then((res) => {
            if (res.rowCount < 1) return [];
            return res.rows.map((sub) => sub.subscription_user_id.toString());
        });

    const subscriptions = await this.getSubscriptionsByStatus("enabled");
    for (const sub of subscriptions.data) {
        const channelID = sub.condition.broadcaster_user_id;
        if (!subscribedIDs.includes(channelID)) {
            this.unsubscribe(sub.id).then(() => {
                logger.debug(`Unsubscribed from unused channel ${channelID}`);
            });
        }
    }
};

logger.info("Initializing EventSub...");
const subscribedIDs = await db.pool
    .query(db.queries.SELECT.getSubscriptions)
    .then((res) => {
        if (res.rowCount < 1) return [];
        return res.rows.map((sub) => sub.subscription_user_id.toString());
    })
    .catch((err) => {
        logger.error("Could not get subscribed channels from database", err);
    });

await tes.subscribeIfNot(subscribedIDs);

export default tes;
