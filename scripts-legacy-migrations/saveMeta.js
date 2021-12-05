const metaDatas = require("./meta-data.json");
const uris = require("./nft-uri.json");
const CID = require("cids");
const ethers = require("ethers");

const admin = require("firebase-admin/app");
const serviceAccount = require("./firebase-admin.json");
const { getFirestore } = require("firebase-admin/firestore");

const app = admin.initializeApp({ credential: admin.cert(serviceAccount) });
const db = getFirestore(app);

metaDatas.forEach((metaData, i) => {
  const data = JSON.parse(metaData);
  const sliceAmt = 4;
  const byteArray = new CID(
    data.image.split("//")[1].split("?")[0]
  ).bytes.slice(sliceAmt);

  var arr = [];
  for (var p in Object.getOwnPropertyNames(byteArray)) {
    arr[p] = byteArray[p];
  }
  const patternHash = ethers.utils.hexlify(arr);

  const fireData = {
    description: data.description,
    gltfCID: data.animation_url.replace("ipfs://", "").split("?")[0],
    isEggvatar: false,
    metaCID: uris[i].replace("ipfs://", ""),
    name: data.name,
    nft: true,
    patternHash,
    svgCID: data.image.replace("ipfs://", "").split("?")[0],
    uid: "LqvpNo5M6RMR4HiMyhhxLj7eFiC3",
    legacy: true,
  };
  db.collection("YAYTSOS").doc(fireData.metaCID).set(fireData);
});
