import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as ethers from "ethers";
import { template } from "./template";

const cors = require("cors")({
  origin: true,
});

const isEmulator = process.env.FUNCTIONS_EMULATOR;

const adminConfig = require("./admin.json");
admin.initializeApp({ credential: admin.credential.cert(adminConfig) });
const db = admin.firestore();
const env = isEmulator ? require("./dev.json") : functions.config();

const provider = ethers.providers.getDefaultProvider("rinkeby", {
  infura: env.provider_keys.infura,
  alchemy: env.provider_keys.alchemy,
  etherscan: env.provider_keys.etherscan,
});
const YAYTSO_RINKEBY_ADDRESS = "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf";
const YAYTSO_MAIN_ADDRESS = "0x155b65c62e2bf8214d1e3f60854df761b9aa92b3";
const YAYTSO_ADDRESS = isEmulator
  ? YAYTSO_RINKEBY_ADDRESS
  : YAYTSO_MAIN_ADDRESS;

import yaytsoInterface from "./Yaytso.json";
import { giveUseryaytsoCreatorRole } from "./discord";
const yaytsoContract = new ethers.Contract(
  YAYTSO_ADDRESS,
  yaytsoInterface.abi,
  provider
);
export enum Collections {
  Users = "Users",
  Yaytsos = "YAYTSOS",
  TxLogs = "TxLogs",
  NFTS = "NFTS",
  Guestlist = "Guestlist",
}

export const onSignIn = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    return { error: "user is not signed in" };
  }
  const {
    uid,
    token: { phone_number },
  } = context.auth;
  const userRef = db.collection(Collections.Users).doc(uid);
  let user = (await userRef.get()).data();
  // New user
  if (!user) {
    const newUserObject = {
      phone_number: phone_number ? phone_number : "",
      hasEggvatar: false,
    };
    userRef.set(newUserObject);
    user = newUserObject;
  }
  // Connecting phone number
  console.log(context.auth);
  console.log(phone_number);
  if (user && !user.phone_number && phone_number) {
    userRef.update({ phone_number });
  }
  return user;
});

export const onCreateEggvatar = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      return { error: "user is not signed in" };
    }
    const { metaCID, svgCID, gltfCID } = data;
    const userRef = db.collection(Collections.Users).doc(context.auth.uid);
    userRef.update({
      hasEggvatar: true,
      eggvatar: { metaCID, svgCID, gltfCID },
    });

    return true;
  }
);

export const egg = functions.https.onRequest(async (request, response) => {
  const eggId = request.path.split("/")[2];
  const egg = await db
    .collection(Collections.Yaytsos)
    .where("svgCID", "==", eggId)
    .get();

  if (egg.size > 0) {
    egg.forEach((eggData) => {
      const egg = eggData.data();
      let eggplate = template.replace("__TITLE__", egg.name);
      eggplate = eggplate.replace(/__DESCRIPTION__/g, egg.description);
      response.send(eggplate);
    });
  } else {
    response.status(200).send("wtf");
  }
});

// webhook from alchemy
export const onTx = functions.https.onRequest(async (request, response) => {
  const { activity } = request.body;
  const { hash, fromAddress } = activity[0];
  const txLogRef = db.collection(Collections.TxLogs).doc(hash);
  const txLog = (await txLogRef.get()).data();
  if (!txLog) {
    response.status(404);
  }
  if (txLog) {
    const receipt = await provider.getTransactionReceipt(hash);
    const log = yaytsoContract.interface.parseLog(receipt.logs[1]);
    const tokenId = log.args[1].toString();
    if (txLog.walletAddress === fromAddress && log.name === "YaytsoLaid") {
      const yaytsoMetaCid = txLog.yaytsoMetaCid;
      const yaytsoRef = db.collection(Collections.Yaytsos).doc(yaytsoMetaCid);
      yaytsoRef.update({ nft: true }).then(async () => {
        const yaytso = (await yaytsoRef.get()).data();
        db.collection(Collections.NFTS)
          .doc(tokenId)
          .set({ tokenId, ...yaytso });
      });
      txLogRef.update({ completed: true });
      db.collection(Collections.Users)
        .doc(txLog.userId)
        .get()
        .then((userDoc) => {
          const user = userDoc.data();
          if (user) {
            const { discordId } = user;
            giveUseryaytsoCreatorRole(discordId);
          }
        });
    }
    response.status(200).send("hi");
  } else {
    response.status(404);
  }
});

export const guestlist = functions.https.onRequest(
  async (request, response) => {
    return cors(request, response, async () => {
      if (request.method === "GET") {
        const code = request.query.code as string;
        const secret = request.query.ss as string;
        if (code) {
          const guestlistRef = db.collection(Collections.Guestlist).doc(code);
          const guestlist = (await guestlistRef.get()).data();
          if (guestlist && guestlist.claimed === false) {
            guestlistRef.update({ claimed: true });
            return response
              .status(200)
              .send({ winner: true, secret: guestlist.secret });
          } else if (secret) {
            if (guestlist && guestlist.secret === secret) {
              return response.status(200).send({
                winner: true,
                secret: guestlist.secret,
                email: guestlist.email,
              });
            }
          }
        }
      }

      if (request.method === "POST") {
        const { email, secret, code } = JSON.parse(request.body);
        const guestlistRef = db.collection(Collections.Guestlist).doc(code);
        const guestlist = (await guestlistRef.get()).data();
        if (guestlist && guestlist.secret === secret) {
          guestlistRef.update({ email });
          return response.status(200).send({ success: true });
        } else {
          return response.status(404).send(false);
        }
      }

      return response.status(404).send(false);
    });
  }
);

export * as discord from "./discord";
