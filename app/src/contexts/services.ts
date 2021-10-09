// FIREBASE SERVICES
import { Collections, db, YAYTSOS } from "../firebase";

export const subscribeToUser = async (userId: string, dispatch: any) => {
  return db
    .collection(Collections.Users)
    .doc(userId)
    .onSnapshot((doc) => {
      dispatch({ type: "UPDATE_USER", user: doc.data() });
    });
};

export const fetchUserYaytsos = async (userId: string) => {
  const res = await db
    .collection(Collections.Yaytso)
    .where("uid", "==", userId)
    .get();
  return res;
};

export const fetchYaytso = async (metaCID: string) => {
  const res = await db.collection(Collections.Yaytso).doc(metaCID).get();
  return res;
};

// USE PROMISE.ALL HERE or some shit
export const batchFetchNFTs = async (tokenIds: number[]) => {
  const promises = tokenIds.map((id) => {
    return db
      .collection(Collections.NFT)
      .doc(id.toString())
      .get()
      .then((doc) => {
        if (doc.data()) {
          return { ...doc.data(), id };
        }
      });
  });
  return Promise.all(promises).then((data) => {
    return data.filter((d) => d);
  });
};

export const subscribeToYaytso = (
  metaCID: string,
  callback: (metadata: any) => void
) =>
  db
    .collection(Collections.Yaytso)
    // .doc(metaCID)
    .where("svgCID", "==", metaCID)
    .onSnapshot((doc) => {
      doc.forEach((d) => {
        const data = d.data();
        callback(data);
      });
    });

export const updateYaytso = (metaCID: string, params: any) => {
  return db
    .collection(Collections.Yaytso)
    .doc(metaCID)
    .update(params)
    .then(console.log)
    .catch(console.log);
};

export const saveNFT = (tokenId: number, params: any) => {
  return db.collection(Collections.NFT).doc(tokenId.toString()).set(params);
};

export const deleteYaytso = (metaCID: string) =>
  db
    .collection(YAYTSOS)
    .doc(metaCID)
    .delete()
    .then(() => true)
    .catch(() => false);

export const addCarton = (id: number, lat: number, lng: number) => {
  return db
    .collection(Collections.Cartons)
    .doc(id.toString())
    .set({ lat, lng, locked: false, yaytsoId: 0 });
};

export const updateCarton = (id: number, params: any) => {
  return db
    .collection(Collections.Cartons)
    .doc(id.toString())
    .update({ ...params });
};
