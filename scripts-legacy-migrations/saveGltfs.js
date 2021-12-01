const metas = require("./meta-data.json");
const fetch = require("node-fetch");
const fs = require("fs");

const promises = metas.map((meta) => {
  const data = JSON.parse(meta);
  const promise = fetch(
    data.animation_url.replace("ipfs://", "http://localhost:8080/ipfs/")
  )
    .then((r) => {
      return r.text();
    })
    .then((d) => {
      return { gltf: d, name: data.name };
    });
  return promise;
});
console.log(promises);
Promise.all(promises).then((gltfs) => {
  gltfs.forEach((gltf) => {
    console.log(gltf.gltf);
    fs.writeFileSync(`./gltfs/${gltf.name}.gltf`, new Buffer(gltf.gltf));
  });
});
