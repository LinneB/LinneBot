import AXIOS from "axios";
import log4js from "../misc/logger.js";
const logger = log4js.getLogger("7tv");

export const api = AXIOS.create({
    baseURL: "https://7tv.io/v3",
    validateStatus: false,
    headers: {
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
});

export const gql = AXIOS.create({
    baseURL: "https://7tv.io/v3/gql",
    method: "post",
    validateStatus: false,
    headers: {
        Authorization: `Bearer ${process.env.SEVENTV_GQL}`,
        "User-Agent": "LinneB/LinneBot (https://github.com/LinneB/LinneBot)",
    },
});

const gqlQueries = {
    ChangeEmoteInSet: `mutation ChangeEmoteInSet($id: ObjectID!, $action: ListItemAction!, $emote_id: ObjectID!, $name: String) {
  emoteSet(id: $id) {
    id
    emotes(id: $emote_id, action: $action, name: $name) {
      id
      name
      __typename
    }
    __typename
  }
}`,
    GetCurrentUser: `query GetCurrentUser {
  user: actor {
    id
  }
}`,
    GetUserForUserPage: `query GetUserForUserPage($id: ObjectID!) {
  user(id: $id) {
    id
    username
    display_name
    created_at
    avatar_url
    style {
      color
      paint_id
      __typename
    }
    biography
    editors {
      id
      permissions
      visible
      user {
        id
        username
        display_name
        avatar_url
        style {
          color
          paint_id
          __typename
        }
        __typename
      }
      __typename
    }
    emote_sets {
      id
      name
      capacity
      owner {
        id
        __typename
      }
      __typename
    }
    roles
    connections {
      id
      username
      display_name
      platform
      linked_at
      emote_capacity
      emote_set_id
      __typename
    }
    __typename
  }
}`,
    GetEmoteSet: `query GetEmoteSet($id: ObjectID!, $formats: [ImageFormat!]) {
  emoteSet(id: $id) {
    id
    name
    flags
    capacity
    origins {
      id
      weight
      __typename
    }
    emotes {
      id
      name
      actor {
        id
        display_name
        avatar_url
        __typename
      }
      origin_id
      data {
        id
        name
        flags
        state
        lifecycle
        host {
          url
          files(formats: $formats) {
            name
            format
            __typename
          }
          __typename
        }
        owner {
          id
          display_name
          style {
            color
            __typename
          }
          roles
          __typename
        }
        __typename
      }
      __typename
    }
    owner {
      id
      username
      display_name
      style {
        color
        __typename
      }
      avatar_url
      roles
      connections {
        id
        display_name
        emote_capacity
        platform
        __typename
      }
      __typename
    }
    __typename
  }
}`,
};

export async function addEmote(setID, emoteID) {
    return gql({
        data: {
            query: gqlQueries.ChangeEmoteInSet,
            operationName: "ChangeEmoteInSet",
            variables: {
                action: "ADD",
                emote_id: emoteID,
                id: setID,
            },
        },
    });
}

export async function addEmoteWithName(setID, emoteID, name) {
    return gql({
        data: {
            query: gqlQueries.ChangeEmoteInSet,
            operationName: "ChangeEmoteInSet",
            variables: {
                action: "ADD",
                emote_id: emoteID,
                id: setID,
                name,
            },
        },
    });
}

export async function removeEmote(setID, emoteID) {
    return gql({
        data: {
            query: gqlQueries.ChangeEmoteInSet,
            operationName: "ChangeEmoteInSet",
            variables: {
                action: "REMOVE",
                emote_id: emoteID,
                id: setID,
            },
        },
    });
}

export async function renameEmote(setID, emoteID, newName) {
    return gql({
        data: {
            query: gqlQueries.ChangeEmoteInSet,
            operationName: "ChangeEmoteInSet",
            variables: {
                action: "UPDATE",
                emote_id: emoteID,
                id: setID,
                name: newName,
            },
        },
    });
}

export async function getBotID() {
    return gql({
        data: {
            query: gqlQueries.GetCurrentUser,
            variables: {},
        },
    });
}

export async function getUserGQL(sevenTVID) {
    return gql({
        data: {
            query: gqlQueries.GetUserForUserPage,
            variables: {
                id: sevenTVID,
            },
        },
    });
}

export async function getEmotesGQL(sevenTVID) {
    return gql({
        data: {
            query: gqlQueries.GetEmoteSet,
            variables: {
                id: sevenTVID,
            },
        },
    });
}

// Get user by 7TV user ID
// NOTE: THIS DOES NOT RETURN EMOTES, USE getTwitchUser OR getEmotes TO GET EMOTES
export async function getUser(sevenTVID) {
    const res = await api({
        method: "get",
        url: `/users/${sevenTVID}`,
    });
    if (res.status === 200) {
        return res.data;
    } else if (res.status === 404) {
        return null;
    }
    logger.error(`7TV returned unexpected status code ${res.status}`);
    return null;
}

// Get user by Twitch ID
export async function getTwitchUser(userid) {
    const res = await api({
        method: "get",
        url: `/users/twitch/${userid}`,
    });
    if (res.status === 200) {
        return res.data;
    } else if (res.status === 404) {
        return null;
    }
    logger.error(`7TV returned unexpected status code ${res.status}`);
    return null;
}

// Get emotes from default emote set by Twitch ID
export async function getEmotes(userid) {
    const user = await getTwitchUser(userid);
    if (!user) {
        return [];
    }
    return user.emote_set.emotes;
}

export default {
    api,
    gql,
    addEmote,
    addEmoteWithName,
    removeEmote,
    renameEmote,
    getBotID,
    getUserGQL,
    getEmotesGQL,
    getUser,
    getTwitchUser,
    getEmotes,
};
