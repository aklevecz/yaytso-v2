import * as functions from "firebase-functions";
import devConfig from "./dev.json";
import fetch from "isomorphic-fetch";
import * as admin from "firebase-admin";
// import { db } from "./db";
import { Collections } from "./types";
import { isAddressCreator } from "./utils";
// import { isAddressCreator } from "./utils";

const LOCAL_HOST_CALLBACK = "http://localhost:3000/callback";
const PROD_HOST_CALLBACK = "https://yaytso.art/callback";

const isEmulator = process.env.FUNCTIONS_EMULATOR;

const baseUrl = "https://discord.com/api";

const clientId = "917496007913246731";
const guildId = "829945948745498664";

export enum Channel {
  OwnerRoom = "917833356757041172",
  EggStream = "921097758365061142",
  NftStream = "928751011504476210",
  Test = "928768327688523828",
}

const env = isEmulator ? devConfig : functions.config();
const db = admin.firestore();
const clientSecret = env.discord.client_secret;
const botToken = env.discord.bot_token;

const redirectUri = isEmulator ? LOCAL_HOST_CALLBACK : PROD_HOST_CALLBACK;

// const ownerRole = "yaytso_owner";
const yaytsoCreatorRoleId = "917833078016180264";

export const giveUseryaytsoCreatorRole = (userId: string) => {
  fetch(
    `${baseUrl}/guilds/${guildId}/members/${userId}/roles/${yaytsoCreatorRoleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
};

const fetchToken = (code: string) => {
  return fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).then((r) => r.json());
};

const getUser = (access_token: string) => {
  return fetch(`${baseUrl}/users/@me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((r) => r.json());
};

const addToGuild = (userId: string, access_token: string, role: string) => {
  const body: any = { access_token };
  if (role) {
    body.roles = [role];
  }

  fetch(`${baseUrl}/guilds/${guildId}/members/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(console.log);
};

type Embed = {
  title: string;
  description: string;
  image: { url: string };
};

const IPFS_HOST =
  // isEmulator
  // ? "http://localhost:8080"
  // :
  "https://gateway.pinata.cloud";

export const createEmbed = (
  title: string,
  description: string,
  cid: string
) => ({ title, description, image: { url: `${IPFS_HOST}/ipfs/${cid}` } });

export const createMessage = (
  content: string,
  embeds: Embed[],
  channel: Channel
) => {
  fetch(
    `${baseUrl}/channels/${!isEmulator ? channel : Channel.Test}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        embeds,
      }),
    }
  ).then(() => {});
};

export const dMessage = functions.https.onRequest((_, res) => {
  const embed = createEmbed(
    "EGG",
    "AN EGG",
    "bafybeigzvyxxwskg4xclrdqgqqbpivjhq5d4f3oblfcgt4vsaeonvu4jmy"
  );
  createMessage("hi", [embed], Channel.OwnerRoom);
  res.send("Hi");
});

export const auth = functions.https.onCall(async (data, context) => {
  const { code } = data;
  const tokens = await fetchToken(code);
  const discordUser = await getUser(tokens.access_token);

  // Already a user && signed in
  if (context.auth) {
    const userRef = db.collection(Collections.Users).doc(context.auth.uid);
    const user = (await userRef.get()).data();
    if (!user) {
      return false;
    }

    // If hasn't been discorded yet
    if (!user.discordId) {
      let role = "";
      if (user.addresses) {
        const isCreator = await isAddressCreator(user.addresses);
        if (isCreator) {
          role = yaytsoCreatorRoleId;
        }
      }

      addToGuild(discordUser.id, tokens.access_token, role);
      admin
        .auth()
        .updateUser(context.auth.uid, { email: discordUser.email })
        .catch(console.log);

      userRef.update({
        email: discordUser.email,
        discord: true,
        discordId: discordUser.id,
        discordUsername: discordUser.username,
      });
    }
    return { discordConnected: true };
  } else {
    // Not signed in
    let user;
    if (discordUser.email) {
      user = await admin
        .auth()
        .getUserByEmail(discordUser.email)
        .catch(() => console.log("no user reocrd"));
    } else {
      user = await admin
        .auth()
        .getUser(discordUser.id)
        .catch(() => console.log("no user record"));
    }

    addToGuild(discordUser.id, tokens.access_token, "");
    let loginToken = "";
    if (user) {
    } else {
      const userParams: any = {
        uid: discordUser.id,
        displayName: discordUser.username + "#" + discordUser.discriminator,
      };
      if (discordUser.email) {
        userParams.email = discordUser.email;
      }
      user = await admin.auth().createUser(userParams);
      const userRef = db.collection(Collections.Users).doc(user.uid);
      userRef.set({
        email: discordUser.email,
        discord: true,
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordDiscriminator: discordUser.discriminator,
      });
    }
    loginToken = await admin.auth().createCustomToken(user.uid);
    return { loginToken };
  }

  return false;
});
