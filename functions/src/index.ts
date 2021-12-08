import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as ethers from "ethers";
import { template } from "./template";

admin.initializeApp({ projectId: "yaytso" });
const db = admin.firestore();

const provider = ethers.providers.getDefaultProvider("rinkeby", {
  // infura: process.env.REACT_APP_INFURA_KEY,
  alchemy: "e4ej--n7cdRR-_rL3f55XQSTc-Z5ZW3j",
  // etherscan: process.env.REACT_APP_ETHERSCAN_KEY,
});
const YAYTSO_RINKEBY_ADDRESS = "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf";

import yaytsoInterface from "./Yaytso.json";
import { giveUseryaytsoCreatorRole } from "./discord";
const yaytsoContract = new ethers.Contract(
  YAYTSO_RINKEBY_ADDRESS,
  yaytsoInterface.abi,
  provider
);
export enum Collections {
  Users = "Users",
  Yaytsos = "YAYTSOS",
  TxLogs = "TxLogs",
  NFTS = "NFTS",
}

export const onSignIn = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    return { error: "user is not signed in" };
  }
  const {
    uid,
    token: { phone_number },
  } = context.auth;
  let user = (await db.collection(Collections.Users).doc(uid).get()).data();
  if (!user) {
    const newUserObject = { phone_number, hasEggvatar: false };
    db.collection(Collections.Users).doc(uid).set(newUserObject);
    user = newUserObject;
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

// import * as discord from "./discord";
// export { discord };
export * as discord from "./discord";
