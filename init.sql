CREATE TABLE chats (
  user_id integer NOT NULL,
  user_name varchar(50) NOT NULL,
  prefix varchar(2) NOT NULL DEFAULT '#',
  PRIMARY KEY (user_id)
);

CREATE TABLE subscriptions (
  chat_id integer NOT NULL,
  subscription_username varchar(50) NOT NULL,
  subscription_user_id integer NOT NULL,
  subscription_id SERIAL NOT NULL,
  PRIMARY KEY (subscription_id),
  CONSTRAINT fk_chats FOREIGN key (chat_id) REFERENCES chats (user_id) ON DELETE CASCADE
);

CREATE TABLE subscribers (
  chat_id integer NOT NULL,
  subscriber_username varchar(50) NOT NULL,
  subscription_id integer NOT NULL,
  CONSTRAINT fk_subscriptions FOREIGN key (subscription_id) REFERENCES subscriptions (subscription_id) ON DELETE CASCADE,
  CONSTRAINT fk_chats FOREIGN key (chat_id) REFERENCES chats (user_id) ON DELETE CASCADE
);

CREATE TABLE commands (
  chat_id integer NOT NULL,
  name varchar(50) NOT NULL,
  reply varchar(400) NOT NULL,
  cooldown integer DEFAULT 1000,
  CONSTRAINT fk_chats FOREIGN key (chat_id) REFERENCES chats (user_id) ON DELETE CASCADE
);
