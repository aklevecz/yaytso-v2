import { db, YAYTSOS } from "../../firebase";

// Needs to be renamed or deprecated
export const svgToImgBlob = async (
  svg?: any
): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> => {
  return new Promise((resolve) => {
    // const canvas = document.createElement("canvas");
    // // document.getElementById("help")?.appendChild(canvas);
    // canvas.width = 1080;
    // canvas.height = 1080;
    // canvas.style.width = "100%";
    // canvas.style.height = "100%";
    // const ctx = canvas.getContext("2d")!;
    // var xml = new XMLSerializer().serializeToString(svg);
    // var svg64 = btoa(xml);
    // var b64Start = "data:image/svg+xml;base64,";

    // var image64 = b64Start + svg64;
    // var img = new Image();
    // img.src = image64;
    // // REFACTOR
    // setTimeout(() => {
    //   ctx.drawImage(img, 0, 0, 1080, 1080);
    //   canvas.toBlob((blob) => {
    //     if (blob) {
    //       resolve(blob);
    //     }
    //   });
    // }, 1000);
    // img.onload = function () {
    //   ctx.drawImage(img, 0, 0, 1080, 1080);
    //   canvas.toBlob((blob) => {
    //     if (blob) {
    //       resolve(blob);
    //     }
    //   });
    // };

    const canvas = document.getElementById("repeater") as HTMLCanvasElement;
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ blob, canvas });
      }
    });
  });
};

export const createBlobs = (
  gltf: object,
  svg: any,
  imgBlob: Blob,
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
  data.append("png", imgBlob);
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
  pngCID: string,
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
      pngCID,
      gltfCID,
      nft: false,
      isEggvatar: uid === name,
    })
    .then(() => true)
    .catch(() => false);
};
