import { CanvasTexture, RepeatWrapping } from "three";
import { NAV_CLASS_NAME } from "../constants";
import { REPEAT_CANVAS_ID } from "../containers/EggCreation/constants";

export const ipfsToHttps = (uri: string) => uri.replace("ipfs", "https");

export const getMarker = (selector: string): any => {
  const MAX_TRIES = 500;
  let tries = 0;
  return new Promise((resolve, __) => {
    const pollMarker = (): any => {
      console.log("polling");
      const markerDom = document.querySelector(selector) as HTMLImageElement;
      if (!markerDom && tries < MAX_TRIES) {
        tries++;
        return setTimeout(pollMarker, 50);
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
  // const img = new Image();
  // img.src = imgDataURL;
  // img.onload = (e) => {
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  // };
};

export const createCanvas = (
  imgDataURL: string
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
      const { width, height } = img;
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(img, 0, 0);
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
  repetitions: number
) => {
  const tinyCanvas = document.createElement("canvas");
  const tinyCtx = tinyCanvas.getContext("2d")!;
  const tinyWidth = width / repetitions;
  const tinyHeight = height / repetitions;
  tinyCtx.canvas.width = tinyWidth;
  tinyCtx.canvas.height = tinyHeight;
  tinyCtx.drawImage(
    copyCanvas,
    0,
    0,
    width,
    height,
    0,
    0,
    tinyWidth,
    tinyHeight
  );
  const repeatCanvas = document.createElement("canvas");
  repeatCanvas.width = width;
  repeatCanvas.height = height;
  const repeatCtx = repeatCanvas.getContext("2d")!;

  const rPattern = repeatCtx.createPattern(tinyCanvas, "repeat")!;
  repeatCtx.fillStyle = rPattern;
  repeatCtx.fillRect(0, 0, width, height);
  eggMask.setAttribute("xlink:href", repeatCanvas.toDataURL());
};

export const createTexture = (
  canvas: HTMLCanvasElement,
  repetitions: number
) => {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.flipY = false;
  texture.repeat.set(repetitions, repetitions);
  return texture;
};

const windowHeight = window.innerHeight;
export const getFullContainerHeight = () => {
  // const windowHeight = window.innerHeight;
  const navEl = document.querySelector(`.${NAV_CLASS_NAME}`) as HTMLDivElement;
  let fullHeight = 0;
  if (navEl) {
    const navHeight = navEl.clientHeight;
    fullHeight = windowHeight - navHeight;
  }
  return fullHeight;
};
