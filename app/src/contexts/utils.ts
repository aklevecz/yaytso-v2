import { CanvasTexture, RepeatWrapping, MirroredRepeatWrapping } from "three";
import { NAV_CLASS_NAME } from "../constants";
import blankEgg from "../assets/blankEgg.png";

export const idToNetwork: { [key: number]: string } = {
  1: "mainnet",
  4: "rinkeby",
  137: "polygon",
};

export const networkToId = {
  mainnet: 1,
  rinkeby: 4,
  polygon: 137,
};

export const ipfsToHttps = (uri: string) => uri.replace("ipfs", "https");

export const getMarker = (selector: string): any => {
  const MAX_TRIES = 100;
  let tries = 0;
  return new Promise((resolve, __) => {
    const pollMarker = (): any => {
      console.log("polling");
      const markerDom = document.querySelector(selector) as HTMLImageElement;
      if (!markerDom && tries < MAX_TRIES) {
        tries++;
        return setTimeout(pollMarker, 200);
      }
      return resolve(markerDom);
    };
    pollMarker();
  });
};

export const fadeIn = (el: HTMLElement) => {
  let o = 0;
  let frame = 0;
  const animate = () => {
    el.style.transform = `scale(${o})`;
    if (o < 1) {
      o += 0.05;
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
    }
  };
  animate();
};

export const delay = (ms: number, callback: Function) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback();
      resolve(true);
    }, ms);
  });
};

export const drawToPreview = (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  width = 200,
  height = 200
) => {
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
};

const CANVAS_DIMS = 1080;
export const createCanvas = (
  imgDataURL: string
): Promise<{ canvas: HTMLCanvasElement; img: HTMLImageElement }> => {
  return new Promise((resolve, __) => {
    const img = new Image();
    img.src = imgDataURL;
    // var regex = /^data:.+\/(.+);base64,(.*)$/;
    // var matches = imgDataURL.match(regex);
    // var ext = matches![1];
    // var data = matches![2];

    img.onload = (e) => {
      console.log("loaded");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }
      const { width, height } = img;
      const aspect = width / height;
      const canvasDim = { width: CANVAS_DIMS, height: CANVAS_DIMS };
      if (aspect > 1) {
        canvasDim.width = width > CANVAS_DIMS ? CANVAS_DIMS : width;
        canvasDim.height = canvasDim.width / aspect;
      } else if (aspect < 1) {
        canvasDim.height = height > CANVAS_DIMS ? CANVAS_DIMS : height;
        canvasDim.width = canvasDim.height * aspect;
        console.log(height, aspect);
      }
      ctx.canvas.width = canvasDim.width;
      ctx.canvas.height = canvasDim.height;
      ctx.drawImage(img, 0, 0, canvasDim.width, canvasDim.height);
      resolve({ canvas, img });
    };
  });
};

export const createCanvasCropped = (
  imgDataURL: string,
  width: number,
  height: number
): Promise<{ canvas: HTMLCanvasElement; img: HTMLImageElement }> => {
  return new Promise((resolve, __) => {
    const img = new Image();
    img.src = imgDataURL;
    img.onload = (e) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      ctx.canvas.width = width;
      ctx.canvas.height = height;

      const imgSize = Math.min(img.width, img.height);
      const left = (img.width - imgSize) / 2;
      const top = (img.height - imgSize) / 2;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, left, top, imgSize, imgSize, 0, 0, width, height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      resolve({ canvas, img });
    };
  });
};

// Could just pass this the egg mask class
export const createEggMask = (
  eggMask: HTMLImageElement,
  copyCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  repetitions: number,
  callback: (value: unknown) => void
) => {
  const tinyCanvas = document.createElement("canvas");
  const tinyCtx = tinyCanvas.getContext("2d")!;

  const blankEggImg = new Image();
  blankEggImg.onload = () => {
    const tinyWidth = width / repetitions;
    const tinyHeight = height / repetitions;
    tinyCtx.canvas.width = tinyWidth;
    tinyCtx.canvas.height = tinyHeight;

    const imgSize = Math.min(copyCanvas.width, copyCanvas.height);
    const left = (copyCanvas.width - imgSize) / 2;
    const top = (copyCanvas.height - imgSize) / 2;

    tinyCtx.drawImage(
      copyCanvas,
      left,
      top,
      imgSize,
      imgSize,
      0,
      0,
      tinyWidth,
      tinyHeight
    );

    // tinyCtx.drawImage(
    //   copyCanvas,
    //   0,
    //   0,
    //   // NO CROP
    //   copyCanvas.width,
    //   copyCanvas.height,
    //   0,
    //   0,
    //   tinyWidth,
    //   tinyWidth
    // );
    const repeatCanvas = document.createElement("canvas");
    repeatCanvas.width = width;
    repeatCanvas.height = height;
    repeatCanvas.id = "repeater";
    repeatCanvas.style.width = "100%";
    repeatCanvas.style.height = "100%";
    const repeatCtx = repeatCanvas.getContext("2d")!;

    repeatCtx.drawImage(
      blankEggImg,
      0,
      0,
      blankEggImg.width,
      blankEggImg.height,
      0,
      0,
      width,
      height
    );
    repeatCtx.globalCompositeOperation = "source-in";

    const rPattern = repeatCtx.createPattern(tinyCanvas, "repeat")!;
    repeatCtx.fillStyle = rPattern;
    repeatCtx.fillRect(0, 0, width, height);

    callback(repeatCanvas);

    // BAD
    document.getElementById("help")!.appendChild(repeatCanvas);
    // eggMask.setAttribute("xlink:href", repeatCanvas.toDataURL());
    // eggMask.onload = () => {
    //   callback(true);
    // };
    // callback(true);
  };
  blankEggImg.src = blankEgg;
};

export const createTexture = (
  canvas: HTMLCanvasElement,
  repetitions: number
) => {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.flipY = false;
  const repeatY =
    canvas.width > canvas.height ? repetitions : repetitions * 0.5;
  const repeatX =
    canvas.height > canvas.width ? repetitions : repetitions * 0.5;
  texture.repeat.set(repeatX, repeatY);
  return texture;
};

const windowHeight = window.innerHeight;
export const getFullContainerHeight = () => {
  const navEl = document.querySelector(`.${NAV_CLASS_NAME}`) as HTMLDivElement;
  let fullHeight = 0;
  if (navEl) {
    const navHeight = navEl.clientHeight;
    fullHeight = windowHeight - navHeight;
  }
  return fullHeight;
};
