import { ethers } from "ethers";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { Egg } from "../../contexts/types";
import { EGGVG, EGG_MASK } from "./constants";
import { createBlobs, saveYaytso, svgToImgBlob } from "./utils";

export const PIN_URL =
  process.env.NODE_ENV === "development"
    ? `http://${window.location.hostname}:8082`
    : "https://pin.yaytso.art";

export const pinBlobs = (data: FormData) => {
  return fetch(PIN_URL, {
    method: "POST",
    body: data,
    headers: {
      credentials: "include",
    },
  })
    .then((r) => r.json())
    .then((d) => d);
};

export const exportYaytso = async (
  scene: Scene | undefined,
  customEgg: Egg,
  userId: string,
  successCallBack: (
    metaCID: string,
    svgCID: string,
    gltfCID: string,
    pngCID: string
  ) => void
) => {
  const exporter = new GLTFExporter();
  if (!scene) {
    return console.error("scene is missing");
  }
  if (customEgg.description === undefined) {
    return console.error("please describe your egg");
  }
  if (customEgg.name === undefined) {
    return console.error("please name your egg");
  }
  const { description, name } = customEgg;
  exporter.parse(
    scene,
    async (sceneGLTF) => {
      const { blob, canvas }: any = await svgToImgBlob();
      console.log("blob made");
      const eggMask = document.getElementById(EGG_MASK)!;
      eggMask.setAttribute("xlink:href", canvas.toDataURL());

      const eggVG = document.getElementById(EGGVG);
      const data: any = createBlobs(sceneGLTF, eggVG, blob, description, name);
      data.append("uid", userId);
      const r = await pinBlobs(data);
      console.log(r);
      if (r.success) {
        var arr: any = [];
        for (var p in Object.getOwnPropertyNames(r.byteArray)) {
          arr[p] = r.byteArray[p];
        }
        const svgUrl = URL.createObjectURL(data.get("svg"));
        const patternHash = ethers.utils.hexlify(arr);
        const response = await saveYaytso(
          userId,
          name,
          r.description,
          patternHash,
          r.metaCID,
          r.svgCID,
          r.pngCID,
          r.gltfCID
        );
        if (response) {
          successCallBack(r.metaCID, r.svgCID, r.gltfCID, r.pngCID);
        } else {
          console.error("save failed");
        }
      }
    },
    { onlyVisible: true }
  );
};

export const exportVanilla = async (scene: Scene | undefined) => {
  const exporter = new GLTFExporter();
  if (!scene) {
    return console.error("scene is missing");
  }
  exporter.parse(
    scene,
    async (result) => {
      var output = JSON.stringify(result, null, 2);
      console.log(output);
      saveString(output, "scene.gltf");

      function save(blob: any, filename: any) {
        var link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link); // Firefox workaround, see #6594
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        // URL.revokeObjectURL( url ); breaks Firefox...
      }

      function saveString(text: any, filename: any) {
        save(new Blob([text], { type: "text/plain" }), filename);
      }
    },
    { onlyVisible: true }
  );
};
