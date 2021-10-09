const admin = require("firebase-admin/app");
const serviceAccount = require("../firebase-admin.json");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const hre = require("hardhat");

// Grabs token ids from the cartons
// then fetches meta data from the contract
async function main() {
  const Yaytso = await hre.ethers.getContractFactory("Yaytso");
  const yaytso = await Yaytso.attach(
    "0x155b65c62e2bf8214d1e3f60854df761b9aa92b3"
  );
  // const uri = await yaytso.tokenURI(1);
  // console.log(uri);

  const app = admin.initializeApp({ credential: admin.cert(serviceAccount) });
  const db = getFirestore(app);
  db.collection("CARTONS")
    .get()
    .then((cartons) => {
      let promises = [];
      cartons.forEach(async (carton) => {
        const tokenId = carton.data().yaytsoId;
        console.log(tokenId);
        if (tokenId) {
          const promise = yaytso.tokenURI(tokenId);
          promises.push(promise);
        }
      });
      Promise.all(promises).then((uris) => {
        fs.writeFileSync("./nft-uri.json", JSON.stringify(uris));
      });
    });
}

main();
