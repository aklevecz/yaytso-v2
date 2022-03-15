import * as functions from "firebase-functions";
import crypto from "crypto";

import { db } from "./db";
import { Collections } from "./types";
import SpatialHashGrid from "./spatialHashGrid";

const hashKey = (key: string) => {
  const hash = crypto.createHash("md5").update(key).digest("hex");
  return hash;
};

const sb = 100;
const scaledArray = (a: any[]) => {
  const a2 = a.map((v) => v * sb);
  const b = a2[1];
  a2[1] = a2[0];
  a2[0] = b;
  return a2;
};

// US Bounds
const US_WEST_LOW = [32.55855446664711, -123.04017406334255];
const US_EAST_HIGH = [47.18915871942106, -68.13861698904304];
// ** US Bounds

const _CLIENT_BOUNDS = [scaledArray(US_WEST_LOW), scaledArray(US_EAST_HIGH)];
const dims = 10;

const CLIENT_WIDTH = Math.abs(_CLIENT_BOUNDS[0][0] - _CLIENT_BOUNDS[1][0]);
const CLIENT_HEIGHT = Math.abs(_CLIENT_BOUNDS[0][1] - _CLIENT_BOUNDS[1][1]);
const aspect = CLIENT_WIDTH / CLIENT_HEIGHT;
export { aspect };

const _CLIENT_DIMENSIONS = [dims * 2, dims];
const grid = new SpatialHashGrid(_CLIENT_BOUNDS, _CLIENT_DIMENSIONS);

const gridRef = db.collection(Collections.Grid);

const getCellId = (carton: any) => {
  const { lat, lng } = carton;
  const pos = scaledArray([lat, lng]);
  const cell = grid._GetCellIndex(pos);
  const cellId = `${cell[0]}-${cell[1]}`;
  return cellId;
};

// Potentially an endless loop here since another Carton is created at the end of the function inside of the Grid
export const onCartonCreated = functions.firestore
  .document(`${Collections.Cartons}/{cartonId}`)
  .onCreate(async (snap, context) => {
    const carton = snap.data();
    carton.id = snap.id;
    const cellId = getCellId(carton);
    const cellRef = gridRef.doc(cellId);

    await cellRef.set({ hash: "is cell data" });
    await cellRef
      .collection(Collections.Cartons)
      .doc(carton.id)
      .set({
        ...carton,
        cartonRef: snap.ref,
      });
  });

export const onCartonUpdate = functions.firestore
  .document(`${Collections.Cartons}/{cartonId}`)
  .onUpdate(async (change, context) => {
    const carton = change.after.data();
    carton.id = change.after.id;
    const cellId = getCellId(carton);
    const cellRef = gridRef.doc(cellId);

    await cellRef.set({ hash: "is a hash" });
    await cellRef
      .collection(Collections.Cartons)
      .doc(carton.id)
      .update({ ...carton });
  });

export const createClaim = functions.https.onCall((data, _) => {
  const { key1, key2, cartonId, yaytsoId } = data;
  const hash = hashKey(key1);
  db.collection(Collections.CartonClaims)
    .doc(hash)
    .set({ key2, cartonId, yaytsoId });
  return true;
});

export const retrieveClaim = functions.https.onCall(async (data, _) => {
  const { key1 } = data;
  const hash = hashKey(key1);
  const claim = (
    await db.collection(Collections.CartonClaims).doc(hash).get()
  ).data();
  if (claim) {
    return claim.key2;
  } else {
    return false;
  }
});
