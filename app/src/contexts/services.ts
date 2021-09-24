// FIREBASE SERVICES
import { db, YAYTSOS } from "../firebase";

export const fetchUserYaytsos = async (userId: string) => {
  const res = await db.collection(YAYTSOS).where("uid", "==", userId).get();
  return res;
};

export const fetchYaytso = async (metaCID: string) => {
  const res = await db.collection(YAYTSOS).doc(metaCID).get();
  return res;
};

export const subscribeToYaytso = (
  metaCID: string,
  callback: (metadata: any) => void
) =>
  db
    .collection(YAYTSOS)
    .doc(metaCID)
    .onSnapshot((doc) => {
      console.log("sub call ", doc.data());
      callback(doc.data());
    });

export const updateYaytso = (metaCID: string, params: any) => {
  return db
    .collection(YAYTSOS)
    .doc(metaCID)
    .update(params)
    .then(console.log)
    .catch(console.log);
};

export const deleteYaytso = (metaCID: string) =>
  db
    .collection(YAYTSOS)
    .doc(metaCID)
    .delete()
    .then(() => true)
    .catch(() => false);
