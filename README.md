# LinneBot

The worst chatbot on Twitch

**WORK IN PROGRESS**: This bot is still in development, and as such I would not recommend deploying it to your own chat. As development continues I may consider adding it to other chats.

- [LinneBot](#linnebot)
  - [Contributing](#contributing)
  - [Setup](#setup)
    - [Configuration](#configuration)
    - [Running](#running)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Setup

You will need a few things to set it up:

- A [Twitch app](https://dev.twitch.tv/console)
- A [MongoDB](https://hub.docker.com/_/mongo) database
- A user access token with scopes: `chat:read chat:edit moderator:manage:chat_messages`
- An HTTPS endpoint (you can use [ngrok](https://ngrok.com/) to simplify this)

### Configuration

First, move the `config.json_example` and `.env_example` files to `config.json` and `.env`.

Fill the .env with your authorization details:
```sh
# Twitch app details
CLIENT_ID="abc123"
CLIENT_SECRET="abc123"

# Bot user details
USER_TOKEN="abc123"
BOT_USERNAME="linnebot"

# EventSub details
BASE_URL="https://example.com"
WEBHOOK_SECRET="thisisarandomstring"

# Database URL
MONGODB_URL="mongodb://user:pass@localhost:27017/linnebot"
```

Fill `config.json` with the rest of your options:
```json
{
    // increased log output
    "debug": false,
    // channels to join
    "channels": [
        "linneb"
    ],
    // port to host website and EventSub on
    "port": 8080
}
```

### Running

The bot can be run using `docker-compose` or as a native `node` script. The process is basically the same for both.

**docker-compose**:
```sh
# Edit the port in docker-compose.yml if neccesary!!
docker-compose up -d
```

**NodeJS**:
```sh
npm install
node index.js
```
