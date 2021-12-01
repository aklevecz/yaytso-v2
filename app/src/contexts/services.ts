// FIREBASE SERVICES
import { Collections, db, YAYTSOS } from "../firebase";

export const subscribeToUser = async (userId: string, dispatch: any) => {
  return db
    .collection(Collections.Users)
    .doc(userId)
    .onSnapshot((doc) => {
      const data = doc.data();
      if (data) {
        const user = Object.keys(data).reduce(
          (acc: { [key: string]: string }, cv) => {
            let key = cv;
            if (cv === "phone_number") {
              key = "phone";
            }
            acc[key] = data[cv];
            return acc;
          },
          {}
        );
        dispatch({ type: "UPDATE_USER", user });
        dispatch({ type: "SET_LOADING", loading: false });
      }
    });
};

export const updateUserAddresses = async (
  userId: string,
  newAddress: string
) => {
  const userRef = db.collection(Collections.Users).doc(userId);
  const user = (await userRef.get()).data();
  if (user) {
    const currentAddresses = user.addresses ? user.addresses : [];
    const addresses = new Set([...currentAddresses, newAddress]);
    return userRef.update({ addresses: Array.from(addresses) });
  }
};

export const fetchUserYaytsos = async (
  userId: string,
  limit: number,
  startAt: number
) => {
  const res = await db
    .collection(Collections.Yaytso)
    .where("uid", "==", userId)
    .orderBy("name")
    .limit(limit)
    .startAt(startAt)
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

export const txLog = (
  txHash: string,
  yaytsoMetaCid: string,
  walletAddress: string,
  userId: string
) => {
  return db
    .collection(Collections.TxLogs)
    .doc(txHash)
    .set({ txHash, yaytsoMetaCid, walletAddress, userId, completed: false });
};
