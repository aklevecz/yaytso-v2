const fetch = require("node-fetch");
const nftUris = require("./nft-uri.json");
const fs = require("fs");
let promises = nftUris.map((uri) =>
  fetch(uri.replace("ipfs://", "http://localhost:8080/ipfs/")).then((r) =>
    r.text()
  )
);
Promise.all(promises).then((metas) => {
  console.log(metas);
  fs.writeFileSync("./meta-data.json", metas);
});
