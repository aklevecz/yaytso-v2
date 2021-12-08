import * as functions from "firebase-functions";
import devConfig from "./dev.json";
import fetch from "isomorphic-fetch";
import * as admin from "firebase-admin";
import { db } from "./db";
import { Collections } from ".";
import { isAddressCreator } from "./utils";
// import { isAddressCreator } from "./utils";

const isEmulator = process.env.FUNCTIONS_EMULATOR;

const baseUrl = "https://discord.com/api";

const clientId = "917496007913246731";
const guildId = "829945948745498664";
const clientSecret = isEmulator
  ? devConfig.discord.client_secret
  : functions.config().discord.client_secret;
const botToken = isEmulator
  ? devConfig.discord.bot_token
  : functions.config().discord.bot_token;
const redirectUri = isEmulator
  ? "http://localhost:3000/callback"
  : "https://yaytso.art/callback";

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

export const auth = functions.https.onCall(async (data, context) => {
  const { code } = data;
  if (!context.auth) {
    return false;
  }
  const userRef = db.collection(Collections.Users).doc(context.auth.uid);
  const user = (await userRef.get()).data();
  if (!user) {
    return false;
  }
  const tokens = await fetch(`${baseUrl}/oauth2/token`, {
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

  // console.log(tokens);

  const discordUser = await fetch(`${baseUrl}/users/@me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  }).then((r) => r.json());

  let role = "";
  if (user.addresses) {
    const isCreator = await isAddressCreator(user.addresses);
    if (isCreator) {
      role = yaytsoCreatorRoleId;
    }
  }

  const body: any = { access_token: tokens.access_token };
  if (role) {
    body.roles = [role];
  }
  fetch(`${baseUrl}/guilds/${guildId}/members/${discordUser.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(console.log)
    .catch(console.log);

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
  return true;
});
