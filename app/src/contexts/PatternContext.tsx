import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { RGBColor } from "react-color";
import { CanvasTexture, RepeatWrapping } from "three";
import { EGG_MASK } from "../containers/EggCreation/constants";
import {
  createCanvas,
  createEggMask,
  createTexture,
  drawToPreview,
} from "./utils";
import heic2any from "heic2any";

type Action =
  | {
      type: "SET_PATTERN";
      pattern: CanvasTexture;
      canvas: HTMLCanvasElement;
      canvasPreview: HTMLCanvasElement;
    }
  | { type: "SET_IMG_UPLOAD"; canvasImgUpload: HTMLCanvasElement }
  | { type: "CLEAR_PATTERN" }
  | { type: "SET_REPETITIONS"; repetitions: number }
  | { type: "INIT_PREVIEW"; canvasPreview: HTMLCanvasElement }
  | {
      type: "SET_PREVIEW_DIMS";
      dims: { w: number; h: number };
    };

type Dispatch = (action: Action) => void;

type State = {
  pattern: CanvasTexture | null;
  canvas: HTMLCanvasElement | null;
  canvasPreview: HTMLCanvasElement | null;
  canvasImgUpload: HTMLCanvasElement | null;
  previewDims: { [key: string]: number };
  repetitions: number;
};

const initialState = {
  pattern: null,
  canvas: null,
  canvasPreview: null,
  canvasImgUpload: null,
  previewDims: { w: 200, h: 200 },
  repetitions: 1,
};

// REFACTOR
// CANVAS PREVIEW AND CANVAS ARE SUPER CONFUSING
// CANVAS PREVIEW IS ACTUALLY WHAT IS USED
const PatternContext = createContext<
  { state: State; dispatch: Dispatch; updateTexture: () => void } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "INIT_PREVIEW":
      return { ...state, canvasPreview: action.canvasPreview };
    case "SET_PATTERN":
      return {
        ...state,
        pattern: action.pattern,
        canvas: action.canvas,
        canvasPreview: action.canvasPreview,
      };
    case "SET_IMG_UPLOAD":
      return { ...state, canvasImgUpload: action.canvasImgUpload };
    case "CLEAR_PATTERN":
      return { ...state, pattern: null, canvas: null, canvasImgUpload: null };
    case "SET_REPETITIONS":
      return { ...state, repetitions: action.repetitions };
    case "SET_PREVIEW_DIMS":
      return {
        ...state,
        previewDims: { w: action.dims.w, h: action.dims.h },
      };
    default:
      return state;
  }
};

const PatternProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // IS this even doing anything?
  useEffect(() => {
    if (!state.pattern && !state.canvas && state.canvasPreview) {
      const previewCanvas = state.canvasPreview;
      const ctx = previewCanvas.getContext("2d")!;

      const w = previewCanvas.width;
      const h = previewCanvas.height;

      ctx.rect(0, 0, w, h);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  }, [state.pattern, state.canvas]);

  useEffect(() => {
    if (state.canvasPreview) {
      const previewCanvas = state.canvasPreview;
      const ctx = previewCanvas.getContext("2d")!;

      const w = previewCanvas.width;
      const h = previewCanvas.height;

      ctx.rect(0, 0, w, h);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  }, [state.canvasPreview]);

  const updateTexture = () => {
    if (!state.canvasPreview) {
      return;
    }
    const canvas = state.canvasPreview;
    const pattern = createTexture(canvas, state.repetitions);
    dispatch({
      type: "SET_PATTERN",
      pattern,
      canvas: canvas,
      canvasPreview: canvas,
    });
  };

  const value = { state, dispatch, updateTexture };
  return (
    <PatternContext.Provider value={value}>{children}</PatternContext.Provider>
  );
};

export { PatternContext, PatternProvider };

const DEFAULT_DIMS = 1080;
export const useCanvasPreview = () => {
  const context = useContext(PatternContext);
  const [fullscreen, setFullscreen] = useState(false);

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const { dispatch, state } = context;

  const { previewDims } = state;

  const initCanvas = (canvasPreview: HTMLCanvasElement) => {
    dispatch({ type: "INIT_PREVIEW", canvasPreview });
  };

  const toggleFullscreen = () => setFullscreen(!fullscreen);

  useEffect(() => {
    let w = DEFAULT_DIMS,
      h = DEFAULT_DIMS;
    if (fullscreen) {
      w = window.innerWidth / 1.1;
      h = w;
      dispatch({
        type: "SET_PREVIEW_DIMS",
        dims: { w, h },
      });
    } else {
      dispatch({
        type: "SET_PREVIEW_DIMS",
        dims: { w, h },
      });
    }
  }, [fullscreen]);

  return { initCanvas, previewDims, toggleFullscreen };
};

// This is pretty specific to the preview pattern
export const useUpdatePattern = () => {
  const [updating, setUpdating] = useState(false);
  const context = useContext(PatternContext);

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const { dispatch, state, updateTexture } = context;

  const uploadPattern = async (e: React.FormEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    if (files === null || files.length === 0) {
      return;
    }
    let file = files[0];
    if (file.name.toLowerCase().includes("heic")) {
      (file as any) = await heic2any({
        blob: file,
        toType: "image/png",
      });
    }
    setUpdating(true);
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (!e.target) {
        return console.error("nothing here");
      }
      if (typeof e.target.result !== "string") {
        return console.error("expecting a single file");
      }
      if (!state.canvasPreview) {
        return console.error("canvas preview is missing");
      }
      const { canvasPreview } = state;
      // const { canvas, img } = await createCanvasCropped(
      //   e.target.result,
      //   200,
      //   200
      // );

      const { canvas, img } = await createCanvas(e.target.result);
      drawToPreview(
        img,
        canvasPreview,
        canvasPreview.width,
        canvasPreview.height
      );
      console.log(canvas);
      const pattern = createTexture(canvas, state.repetitions);
      console.log(canvas);
      dispatch({ type: "SET_PATTERN", canvas, pattern, canvasPreview });
      // updateTexture();
      dispatch({ type: "SET_IMG_UPLOAD", canvasImgUpload: canvas });
      setUpdating(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!state.canvas || !state.canvasPreview) {
      return;
    }

    const pattern = createTexture(state.canvas, state.repetitions);
    dispatch({
      type: "SET_PATTERN",
      canvas: state.canvas,
      pattern,
      canvasPreview: state.canvasPreview,
    });
  }, [state.repetitions]);

  const clearPattern = () => dispatch({ type: "CLEAR_PATTERN" });

  const updatePatternRepetitions = (repetitions: number) =>
    dispatch({ type: "SET_REPETITIONS", repetitions });

  const drawEggMask = () => {
    return new Promise((resolve, reject) => {
      if (!state.canvas) {
        return reject("No canvas");
      }
      const eggMask = document.getElementById("egg-mask") as HTMLImageElement;

      // OVERRIDE THE DIMS UNT
      createEggMask(
        eggMask,
        state.canvas,
        // state.canvas.width,
        // state.canvas.height,
        1080,
        1080,
        state.repetitions,
        resolve
      );
    });
  };

  return {
    clearPattern,
    uploadPattern,
    updatePatternRepetitions,
    pattern: state.pattern,
    updating,
    canvas: state.canvas,
    repetitions: state.repetitions,
    drawEggMask,
  };
};

export const usePattern = () => {
  const context = useContext(PatternContext);

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const { state } = context;

  return state.pattern;
};

const DEFAULT_LINE_WIDTH = 15;
const RGB_BLACK = { r: 0, g: 0, b: 0, a: 1 };
export const useDraw = () => {
  const context = useContext(PatternContext);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [color, setColor] = useState<RGBColor>(RGB_BLACK);

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const { dispatch, state, updateTexture } = context;
  const { canvasPreview: canvas } = state;
  const updateLineWidth = (width: number) => setLineWidth(width);

  const updateColor = (color: RGBColor) => {
    setColor(color);
  };

  const clearDrawing = async () => {
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (state.canvasImgUpload) {
      if (!state.canvasPreview) {
        return;
      }
      drawToPreview(
        state.canvasImgUpload as any,
        state.canvasPreview,
        state.canvasPreview.width,
        state.canvasPreview.height
      );
      const pattern = createTexture(state.canvasPreview, state.repetitions);
      dispatch({
        type: "SET_PATTERN",
        canvas: state.canvasPreview,
        pattern,
        canvasPreview: state.canvasPreview,
      });
      // updateTexture();
    } else {
      dispatch({ type: "CLEAR_PATTERN" });
    }
  };

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const mousePos = { x: 0, y: 0 };
    const prevMouse = { x: 0, y: 0 };

    let mouseDown = false;
    let mouseMoved = false;

    let timeDown = new Date();

    const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    const setMouse = (e: any) => {
      mousePos.x = e.touches ? e.touches[0].clientX : e.clientX;
      mousePos.y = e.touches ? e.touches[0].clientY : e.clientY;
    };

    const normalizedPos = () => {
      const rect = canvas.getBoundingClientRect();
      const w = canvas.width;
      const h = canvas.height;
      const nX = (mousePos.x - rect.left) * (w / rect.width);
      const nY = (mousePos.y - rect.top) * (h / rect.height);
      return { x: nX, y: nY };
    };

    const drawPoint = (x: number, y: number) => {
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.strokeStyle = colorString;

      ctx.lineWidth = lineWidth * 2;
      ctx.moveTo(prevMouse.x, prevMouse.y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(prevMouse.x, prevMouse.y, lineWidth, 0, 2 * Math.PI);

      ctx.fillStyle = colorString;
      ctx.fill();
    };

    const drawDot = (x: number, y: number) => {
      const ctx = canvas.getContext("2d")!;

      ctx.beginPath();
      ctx.arc(x, y, lineWidth, 0, 2 * Math.PI);

      ctx.fillStyle = colorString;
      ctx.fill();
    };

    const PRESSED_TIME_MS = 100;
    const onMove = (e: any) => {
      mouseMoved = true;
      setMouse(e);
      const { x, y } = normalizedPos();
      if (mouseDown && prevMouse.x !== 0 && prevMouse.y !== 0) {
        drawPoint(x, y);
      }
      prevMouse.x = x;
      prevMouse.y = y;
      const downDelta = new Date().getTime() - timeDown.getTime();
      if (downDelta > PRESSED_TIME_MS) {
        updateTexture();
        timeDown = new Date();
      }
    };

    const onDown = (e: any) => {
      timeDown = new Date();
      setMouse(e);
      mouseDown = true;
      mouseMoved = false;
    };

    const onUp = (e: any) => {
      const downDelta = new Date().getTime() - timeDown.getTime();
      if (!mouseMoved && downDelta > PRESSED_TIME_MS) {
        const { x, y } = normalizedPos();
        drawDot(x, y);
      }
      mousePos.x = 0;
      mousePos.y = 0;
      prevMouse.x = 0;
      prevMouse.y = 0;
      mouseDown = false;
      updateTexture();
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove);

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);

    canvas.addEventListener("touchstart", onDown);
    canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);

      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup", onUp);

      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [canvas, state.repetitions, lineWidth, color]);
  return { lineWidth, updateLineWidth, color, updateColor, clearDrawing };
};
