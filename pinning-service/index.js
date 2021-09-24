const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const fs = require("fs");
const express = require("express");
const ethers = require("ethers");
const cors = require("cors");
const multer = require("multer");
const CID = require("cids");
const upload = multer();
const admin = require("firebase-admin");

const serviceAccount = require(path.resolve(
  __dirname,
  "./firebase-admin.json"
));

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const { NFTStorage, Blob } = require("nft.storage");
const IPFS = require("ipfs-core");

const apiKey = process.env.NFT_STORAGE_TOKEN;
const metadataFile = fs.readFileSync("metadataTemplate.json");
const dev = process.env.NODE_ENV === "dev";

if (dev) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

(async () => {
  const client = dev ? await IPFS.create() : new NFTStorage({ token: apiKey });

  const store = async (blob) => {
    let id;
    if (dev) {
      const { cid } = await client.add(blob);
      id = cid.toString();
    } else {
      const b = new Blob([blob]);
      id = await client.storeBlob(b);
    }
    return id;
  };

  app.get("/", (req, res) => {
    res.send(process.env.NODE_ENV);
  });

  app.post("/", upload.any(), async (req, res) => {
    const { name, desc, uid } = req.body;
    console.log(name, desc);
    const gltf = req.files[0];
    const svg = req.files[1];
    const gltfCID = await store(gltf.buffer);
    const svgCID = await store(svg.buffer);

    const metadata = JSON.parse(metadataFile);
    metadata.image = metadata.image.replace("__HASH__", svgCID);
    metadata.animation_url = metadata.animation_url.replace(
      "__HASH__",
      gltfCID
    );
    metadata.name = name;
    metadata.description = desc;

    let meta_id;
    const metaString = JSON.stringify(metadata);
    meta_id = await store(metaString);
    const metaCID = meta_id;

    console.log(metaCID);
    console.log(metadata);

    const sliceAmt = dev ? 2 : 4;
    const byteArray = new CID(svgCID).bytes.slice(sliceAmt);

    var arr = [];
    for (var p in Object.getOwnPropertyNames(byteArray)) {
      arr[p] = byteArray[p];
    }
    const patternHash = ethers.utils.hexlify(arr);

    if (uid) {
      db.collection("YAYTSOS").doc(metaCID).set({
        name,
        description: desc,
        patternHash,
        metaCID,
        svgCID,
        gltfCID,
        uid,
        nft: false,
      });
    }

    return res.send({
      uid,
      metaCID,
      svgCID,
      gltfCID,
      byteArray,
      success: true,
    });
  });

  const port = process.env.PORT || 8082;
  app.listen(port, () => {
    console.log("NFT-Service listening on port", port);
  });
})();
