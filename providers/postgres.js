const { Pool } = require("pg");
const logger = require("../misc/logger").getLogger("postgres");

if (!process.env.DATABASE_URL) {
  logger.fatal("Missing DATABASE_URL in .env");
  process.exit(1);
}

exports.pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.queries = {
  INSERT: {
    // TODO: Add custom cooldown support instead defaulting to 1000ms
    addCommand:
      "INSERT INTO commands(chat_id, name, reply) VALUES ($1, $2, $3)",

    // Add subscription by chatID and subscription userID + username
    addSubscription:
      "INSERT INTO subscriptions(chat_id, subscription_username, subscription_user_id) VALUES ($1, $2, $3)",

    // Add subscriber by chatID and subscription ID
    addSubscriber:
      "INSERT INTO subscribers(chat_id, subscriber_username, subscription_id) VALUES ($1, $2, $3)",

    // Adds a chat by chat ID and chat username
    addChat: "INSERT INTO chats(user_id, user_name) VALUES ($1, $2)",
  },
  SELECT: {
    // Gets command by chatID and command name
    getCommand: "SELECT * FROM commands WHERE chat_id = $1 AND name = $2",

    // Gets all commands by chat username
    getCommands:
      "SELECT * FROM commands c JOIN chats ch ON ch.user_id = c.chat_id WHERE ch.user_name = $1",

    // Gets all chats subscribed to subscription userID
    getSubscribedChatsByUserID:
      "SELECT c.user_name FROM subscriptions su JOIN chats c ON c.user_id = su.chat_id WHERE su.subscription_user_id = $1",

    // Gets subscribers and chat username from subscription userID
    getSubscribersByUserID: `SELECT c.user_name AS chat_username, s.subscriber_username
      FROM subscribers s
      JOIN chats c ON c.user_id = s.chat_id
      JOIN subscriptions su ON su.subscription_id = s.subscription_id
      WHERE su.subscription_user_id = $1`,

    // Gets all unique subscription userIDs
    getSubscriptions:
      "SELECT subscription_user_id FROM subscriptions GROUP BY subscription_user_id",

    // Gets subscription by chatID and subscription username
    getSubscription:
      "SELECT * FROM subscriptions WHERE chat_id = $1 AND subscription_username = $2",

    // Gets subscriber by chatID and subscription username and subscriber username
    getSubscriber: `SELECT *
      FROM subscribers s
      JOIN subscriptions su ON su.subscription_id = s.subscription_id
      WHERE s.chat_id = $1
      AND su.subscription_username = $2
      AND s.subscriber_username = $3`,

    // Gets chats
    getChats: "SELECT * FROM chats GROUP BY user_id",
  },
  UPDATE: {
    // Updates command reply by chatID and command name
    updateCommand:
      "UPDATE commands SET reply = $3 WHERE chat_id = $1 AND name = $2",
  },
  DELETE: {
    // Removes command by chatID and command name
    deleteCommand: "DELETE FROM commands WHERE chat_id = $1 AND name = $2",

    // Removes subscription by chatID and subscription userID
    deleteSubscription:
      "DELETE FROM subscriptions WHERE chat_id = $1 AND subscription_user_id = $2",

    // Removes subscriber by chatID and subscriber username and subscription ID
    deleteSubscriber:
      "DELETE FROM subscribers WHERE chat_id = $1 AND subscriber_username = $2 AND subscription_id = $3",
  },
};
