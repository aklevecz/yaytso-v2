import { useEffect, useRef, useState } from "react";
import EggMask from "../../components/Mask/Egg";
import { useOpenModal } from "../../contexts/ModalContext";
import { useDraw, useUpdatePattern } from "../../contexts/PatternContext";
import {
  useThreePatternUpdater,
  useThreeScene,
} from "../../contexts/ThreeContext";
import { useCustomEgg, useUser } from "../../contexts/UserContext";
import { EGGVG, EGG_MASK, ViewStates } from "./constants";
import { exportYaytso } from "./services";
import Buttons from "./Buttons";

import "../../styles/egg.css";
import { ModalTypes } from "../../contexts/types";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import { onCreateEggvatar } from "../../firebase";
import EggPreview from "./EggPreview";
import { svgToImgBlob } from "./utils";

import baoImg from "../../assets/bao.png";
import blankEgg from "../../assets/blankEgg.png";

export default function Egg() {
  const [viewState, setViewState] = useState<ViewStates>(ViewStates.Blank);
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { initScene, scene } = useThreeScene();
  // This loads a blank egg
  useThreePatternUpdater();
  const {
    uploadPattern,
    updatePatternRepetitions,
    pattern,
    clearPattern,
    updating,
    canvas,
    repetitions,
    drawEggMask,
  } = useUpdatePattern();
  const { customEgg, clearEgg } = useCustomEgg();
  const openModal = useOpenModal();

  const user = useUser();

  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }

    const cleanup = initScene(sceneContainer.current);

    return () => cleanup();
  }, [initScene]);

  useEffect(() => {
    if (
      (pattern && customEgg.name) ||
      // && customEgg.description
      (pattern && !user.hasEggvatar)
    ) {
      setShowPreview(true);
      return setViewState(ViewStates.Customized);
    }
    if (pattern) {
      setShowPreview(true);
      return setViewState(ViewStates.Pattern);
    }
    // setShowPreview(false);
    return setViewState(ViewStates.Blank);
  }, [pattern, customEgg]);

  // MAYBE ONLY IF WAS CREATED?
  useEffect(() => {
    return () => clearEgg();
  }, []);

  useEffect(() => {
    if (user.uid && !user.hasEggvatar) {
      openModal(ModalTypes.Welcome);
    }
  }, [user, user.hasEggvatar]);

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const reset = () => {
    clearPattern();
    clearEgg();
  };

  const { name, description } = customEgg;

  const onExport = async () => {
    await drawEggMask();
    setViewState(ViewStates.Creating);
    exportYaytso(scene, customEgg, user.uid, (metaCID, svgCID, gltfCID) => {
      setViewState(ViewStates.Success);
      openModal(ModalTypes.ExportReceipt, {
        metaCID,
        svgCID,
        gltfCID,
        name,
        description,
        canvas,
        repetitions,
      });
    });
  };

  const onEggvatar = async () => {
    await drawEggMask();
    setViewState(ViewStates.Creating);
    exportYaytso(
      scene,
      { name: user.uid, description: `An eggvatar` },
      user.uid,
      (metaCID, svgCID, gltfCID, pngCID) => {
        console.log("success");
        setViewState(ViewStates.Success);
        onCreateEggvatar({ metaCID, svgCID, gltfCID, pngCID });
        openModal(ModalTypes.ExportReceipt, {
          metaCID,
          svgCID,
          gltfCID,
          name: "Your eggvatar!",
          description,
          canvas,
          repetitions,
        });
      }
    );
  };

  // useEffect(() => {
  //   const canvas = document.getElementById("test-mask")! as HTMLCanvasElement;
  //   const ctx = canvas.getContext("2d")!;
  //   const baoI = new Image();
  //   const eggI = new Image();

  //   eggI.onload = () => {
  //     ctx.drawImage(
  //       eggI,
  //       0,
  //       0,
  //       eggI.width,
  //       eggI.height,
  //       0,
  //       0,
  //       canvas.width,
  //       canvas.height
  //     );
  //     ctx.globalCompositeOperation = "source-in";
  //     baoI.onload = () => {
  //       ctx.drawImage(
  //         baoI,
  //         0,
  //         0,
  //         baoI.width,
  //         baoI.height,
  //         0,
  //         0,
  //         canvas.width,
  //         canvas.height
  //       );
  //     };
  //   };
  //   baoI.src = baoImg;
  //   eggI.src = blankEgg;
  // });

  return (
    <LayoutFullHeight>
      <div
        id="help"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: "red",
          display: process.env.NODE_ENV === "development" ? "none" : "none",
        }}
      />
      <div className="egg__container">
        {pattern && (
          <div className="slider__container">
            <input
              onChange={(e) => {
                const value = e.target.value;
                if (!parseInt(value)) return;
                updatePatternRepetitions(parseInt(value));
              }}
              type="range"
              min="1"
              max="100"
              value={repetitions}
              className="slider"
              id="myRange"
            />
            <div style={{ userSelect: "none" }}>{repetitions}</div>
          </div>
        )}
        <div className="canvas__container" ref={sceneContainer} />
        <EggPreview
          ref={canvasRef}
          customEgg={customEgg}
          openPreview={openPreview}
          closePreview={closePreview}
          showPreview={showPreview}
        />

        <div style={{ textAlign: "center" }}>
          <Buttons
            user={user}
            openModal={openModal}
            viewState={viewState}
            inputRef={inputRef}
            reset={reset}
            onExport={onExport}
            onEggvatar={onEggvatar}
            uploadPattern={uploadPattern}
            updating={updating}
          />
        </div>
        <div
          onClick={() => {
            drawEggMask();
            // svgToImgBlob(document.getElementById(EGGVG));
          }}
          style={{
            position: "absolute",
            right: 0,
            top: 500,
            width: 200,
            background: "red",
            display: process.env.NODE_ENV === "development" ? "block" : "none",
          }}
        >
          <EggMask visible={true} svgId={EGGVG} imgId={EGG_MASK} />
        </div>
        {/* <canvas width={200} height={200} id={REPEAT_CANVAS_ID} style={{ position: "absolute", top: 200, left: 0, border: "1px solid black" }} /> */}
      </div>
      {/* <button style={{ position: "absolute", top: 10, left: 10 }} onClick={() => openModal(ModalTypes.Mint, { metadata: {} })}>export</button> */}
    </LayoutFullHeight>
  );
}
