require("dotenv").config();
const fs = require("fs");
const { NFTStorage, File, Blob } = require("nft.storage");
const metadataFile = fs.readFileSync("metadataTemplate.json");

const token = process.env.NFT_STORAGE_TOKEN;
dev = true;
const config = dev
  ? { token }
  : { token, endpoint: new URL("http://localhost:8080") };
const client = new NFTStorage(config);

const image = fs.readFileSync("./smiler.svg");
(async () => {
  const store = async (blob) => {
    const b = new Blob([blob]);
    const id = await client.storeBlob(b);
    return id;
  };
  const metadata = JSON.parse(metadataFile);
  metadata.image = metadata.image.replace("__HASH__", "svgCID");
  metadata.animation_url = metadata.animation_url.replace(
    "__HASH__",
    "gltfCID"
  );
  metadata.name = "name";
  metadata.description = "desc";

  let meta_id;
  const metaString = JSON.stringify(metadata);
  meta_id = await store(metaString);
  const metaCID = meta_id;

  console.log(metaCID);
})();
