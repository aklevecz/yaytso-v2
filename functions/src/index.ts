import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { template } from "./template";

admin.initializeApp({ projectId: "yaytso" });
const db = admin.firestore();

enum Collections {
  Users = "Users",
  Yaytsos = "YAYTSOS",
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
