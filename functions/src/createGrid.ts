import SpatialHashGrid from "./spatialHashGrid";
import * as admin from "firebase-admin";
import crypto from "crypto";

// import { db } from "./db";
import { Collections } from "./types";

const adminConfig = require("./admin.json");
// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8081";

admin.initializeApp({ credential: admin.credential.cert(adminConfig) });
export const db = admin.firestore();
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

// Cities
export const LA_CENTER = [34.05543946926161, -118.25384004488699];
export const LA_SANTA_MONICA = [34.02254880639961, -118.48802465283318];
export const SF_CENTER = [37.77624563031851, -122.42267222293583];
// ** Cities

const _CLIENT_BOUNDS = [scaledArray(US_WEST_LOW), scaledArray(US_EAST_HIGH)];
const dims = 10;

const CLIENT_WIDTH = Math.abs(_CLIENT_BOUNDS[0][0] - _CLIENT_BOUNDS[1][0]);
const CLIENT_HEIGHT = Math.abs(_CLIENT_BOUNDS[0][1] - _CLIENT_BOUNDS[1][1]);
const aspect = CLIENT_WIDTH / CLIENT_HEIGHT;
export { aspect };

const _CLIENT_DIMENSIONS = [dims * 2, dims];
console.log(_CLIENT_BOUNDS);
const grid = new SpatialHashGrid(_CLIENT_BOUNDS, _CLIENT_DIMENSIONS);
const index = grid._GetCellIndex(scaledArray(LA_SANTA_MONICA));
console.log(index);
// console.log(grid._cells[1][0]!.client._cells.nodes[0], "hi");

const gridRef = db.collection("Grid");
db.collection("CARTONS")
  .get()
  .then(async (snaps) => {
    const cartons: any[] = [];
    snaps.forEach(async (snap) => {
      cartons.push({ id: snap.id, ...snap.data() });
    });
    const indices = new Set();
    for (let i = 0; i < cartons.length; i++) {
      const carton = cartons[i];
      const { lat, lng } = carton;
      const pos = scaledArray([lat, lng]);
      const index = grid._GetCellIndex(pos);
      const indexString = `${index[0]}-${index[1]}`;
      indices.add(indexString);
      const cellRef = gridRef.doc(indexString);

      await cellRef.set({ hash: "is cell data" });
      await cellRef
        .collection(Collections.Cartons)
        .doc(carton.id)
        .set({ ...carton });
    }

    indices.forEach(async (index: any) => {
      console.log(index);
      const cellRef = gridRef.doc(index);
      const allData = await cellRef.collection(Collections.Cartons).get();
      const cartonIds: string[] = [];
      allData.forEach((carton) => {
        cartonIds.push(carton.id);
      });
      const hash = crypto
        .createHash("md5")
        .update(JSON.stringify(cartonIds))
        .digest("hex");
      cellRef.set({ hash });
    });

    console.log("done");
  });
//      const hash = crypto.createHash("md5").update(key).digest("hex");

// grid._cells.forEach((cell, i) => {
//   cell.forEach((celly, i) => {
//     console.log(i);
//     cellRef
//       .doc(i.toString())
//       .collection("celly")
//       .doc(i.toString())
//       .set({ cell: celly ? celly.client.position : null }).then(() => {

//       });
//   });
// });
