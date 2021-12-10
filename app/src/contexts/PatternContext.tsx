import {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { REPEAT_CANVAS_ID } from "../containers/EggCreation/constants";
import {
  createCanvas,
  createCanvasCropped,
  createEggMask,
  createTexture,
  drawToPreview,
} from "./utils";

type Action =
  | {
      type: "SET_PATTERN";
      pattern: CanvasTexture;
      canvas: HTMLCanvasElement;
      canvasPreview: HTMLCanvasElement;
    }
  | { type: "CLEAR_PATTERN" }
  | { type: "SET_REPETITIONS"; repetitions: number }
  | { type: "INIT_PREVIEW"; canvasPreview: HTMLCanvasElement }
  | {
      type: "SET_PREVIEW_DIMS";
      dims: { w: number; h: number };
      oldCanvas: any;
    };

type Dispatch = (action: Action) => void;

type State = {
  pattern: CanvasTexture | null;
  canvas: HTMLCanvasElement | null;
  canvasPreview: HTMLCanvasElement | null;
  oldCanvas: any;
  previewDims: { [key: string]: number };
  repetitions: number;
};

const initialState = {
  pattern: null,
  canvas: null,
  canvasPreview: null,
  oldCanvas: null,
  previewDims: { w: 200, h: 200 },
  repetitions: 1,
};

const PatternContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
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
    case "CLEAR_PATTERN":
      return { ...state, pattern: null, canvas: null };
    case "SET_REPETITIONS":
      return { ...state, repetitions: action.repetitions };
    case "SET_PREVIEW_DIMS":
      return {
        ...state,
        previewDims: { w: action.dims.w, h: action.dims.h },
        oldCanvas: action.oldCanvas,
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

  const value = { state, dispatch };
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

  const { previewDims, oldCanvas } = state;

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
        oldCanvas: state.canvasPreview,
      });
    } else {
      dispatch({
        type: "SET_PREVIEW_DIMS",
        dims: { w, h },
        oldCanvas: state.canvasPreview,
      });
    }
  }, [fullscreen]);

  return { initCanvas, previewDims, toggleFullscreen, oldCanvas };
};

// This is pretty specific to the preview pattern
export const useUpdatePattern = () => {
  const [updating, setUpdating] = useState(false);
  const context = useContext(PatternContext);

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const { dispatch, state } = context;

  // useEffect(() => {
  //   if (!canvasPreview) {
  //     console.log("missing preview");
  //     return;
  //   }
  //   dispatch({ type: "INIT_PREVIEW", canvasPreview });
  // }, [canvasPreview]);

  const uploadPattern = (e: React.FormEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    if (files === null || files.length === 0) {
      return;
    }
    const file = files[0];
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
      drawToPreview(img, canvasPreview);

      // This could just be created at export -- but there is some sanity in the redudancy at the moment
      const eggMask = document.getElementById("egg-mask") as HTMLImageElement;
      createEggMask(
        eggMask,
        canvas,
        canvas.width,
        canvas.height,
        state.repetitions
      );

      const pattern = createTexture(canvas, state.repetitions);
      dispatch({ type: "SET_PATTERN", canvas, pattern, canvasPreview });
      setUpdating(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!state.canvas || !state.canvasPreview) {
      return;
    }
    const eggMask = document.getElementById("egg-mask") as HTMLImageElement;
    createEggMask(
      eggMask,
      state.canvas,
      state.canvas.width,
      state.canvas.height,
      state.repetitions
    );
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

  return {
    clearPattern,
    uploadPattern,
    updatePatternRepetitions,
    pattern: state.pattern,
    updating,
    canvas: state.canvas,
    repetitions: state.repetitions,
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

export const useDraw = () => {
  const context = useContext(PatternContext);
  const [lineWidth, setLineWidth] = useState(30);
  const [color, setColor] = useState("#FFF");

  if (context === undefined) {
    throw new Error("must be within its provider: Pattern");
  }

  const updateLineWidth = (width: number) => setLineWidth(width);
  const updateColor = (color: string) => setColor(color);

  const { dispatch, state } = context;
  const { canvasPreview: canvas } = state;
  useEffect(() => {
    if (!canvas) {
      return;
    }
    const mousePos = { x: 0, y: 0 };
    const prevMouse = { x: 0, y: 0 };

    let mouseDown = false;
    let mouseMoved = false;

    const ctx = canvas.getContext("2d")!;

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

    const onMove = (e: any) => {
      mouseMoved = true;
      setMouse(e);
      const { x: nX, y: nY } = normalizedPos();
      if (mouseDown && prevMouse.x !== 0 && prevMouse.y !== 0) {
        const ctx = canvas.getContext("2d")!;
        ctx.beginPath();
        // ctx.arc(100, 75, 50, 0, 2 * Math.PI);

        // ctx.strokeStyle = colorRef.current;
        ctx.strokeStyle = color;

        ctx.lineWidth = lineWidth;
        ctx.moveTo(prevMouse.x, prevMouse.y);
        ctx.lineTo(nX, nY);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nX, nY, lineWidth, 0, 2 * Math.PI);

        ctx.fillStyle = color;
        ctx.fill();

        const eggMask = document.getElementById("egg-mask") as HTMLImageElement;
        createEggMask(eggMask, canvas, 200, 200, state.repetitions);
        const pattern = createTexture(canvas, state.repetitions);
        dispatch({
          type: "SET_PATTERN",
          canvas,
          pattern,
          canvasPreview: canvas,
        });
      }
      prevMouse.x = nX;
      prevMouse.y = nY;
    };

    // clean this up
    const onDown = (e: any) => {
      setMouse(e);
      mouseDown = true;
      mouseMoved = false;
    };

    const onUp = (e: any) => {
      if (!mouseMoved) {
        const { x, y } = normalizedPos();
        // ctx.fillStyle = colorRef.current;
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, 5, 5);
        const pattern = createTexture(canvas, state.repetitions);
        // TOD: Refactor?
        const eggMask = document.getElementById("egg-mask") as HTMLImageElement;
        createEggMask(eggMask, canvas, 200, 200, state.repetitions);
        dispatch({
          type: "SET_PATTERN",
          canvas,
          pattern,
          canvasPreview: canvas,
        });
      }
      mousePos.x = 0;
      mousePos.y = 0;
      prevMouse.x = 0;
      prevMouse.y = 0;
      mouseDown = false;
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

  return { lineWidth, updateLineWidth, color, updateColor };
};
