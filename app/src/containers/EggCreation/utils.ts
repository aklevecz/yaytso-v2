import { db, YAYTSOS } from "../../firebase";

export const createBlobs = (
  gltf: object,
  svg: any,
  desc: string,
  name: string
): FormData => {
  const data = new FormData();

  const gltfString = JSON.stringify(gltf);
  const gltfBlob = new Blob([gltfString], { type: "text/json" });
  data.append("gltf", gltfBlob);

  const svgClone: any = svg.cloneNode(true);
  svgClone.style.display = "";
  const outerSVGHTML = svgClone.outerHTML;
  const svgBlob = new Blob([outerSVGHTML], {
    type: "img/svg+xml;charset=utf-8",
  });
  data.append("svg", svgBlob);
  data.append("desc", desc);
  data.append("name", name);

  return data;
};

export const saveYaytso = async (
  uid: string,
  name: string,
  description: string,
  patternHash: string,
  metaCID: string,
  svgCID: string,
  gltfCID: string
) => {
  return db
    .collection(YAYTSOS)
    .doc(metaCID)
    .set({
      uid,
      name,
      description,
      patternHash,
      metaCID,
      svgCID,
      gltfCID,
      nft: false,
    })
    .then(() => true)
    .catch(() => false);
};
