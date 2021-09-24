import { useEffect, useRef, useState } from "react";
import EggMask from "../../components/Mask/Egg";
import { useOpenModal } from "../../contexts/ModalContext";
import { useDraw, useUpdatePattern } from "../../contexts/PatternContext";
import {
  useThreePatternUpdater,
  useThreeScene,
} from "../../contexts/ThreeContext";
import { useCustomEgg, useUser } from "../../contexts/UserContext";
import {
  EGGVG,
  EGG_MASK,
  PREVIEW_CANVAS_ID,
  REPEAT_CANVAS_ID,
  ViewStates,
} from "./constants";
import { exportYaytso, exportVanilla } from "./services";
import Buttons from "./Buttons";

import "../../styles/egg.css";
import { ModalTypes } from "../../contexts/types";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import Button from "../../components/Button";
import Pen from "../../components/icons/Pen";

export default function Egg() {
  const [viewState, setViewState] = useState<ViewStates>(ViewStates.Blank);
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const draw = useDraw(canvasRef.current);
  const { initScene, scene } = useThreeScene();
  useThreePatternUpdater();
  const {
    uploadPattern,
    updatePatternRepetitions,
    pattern,
    clearPattern,
    updating,
    canvas,
    repetitions,
  } = useUpdatePattern(canvasRef.current);
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
    if (pattern && customEgg.name && customEgg.description) {
      return setViewState(ViewStates.Customized);
    }
    if (pattern) {
      setShowPreview(true);
      return setViewState(ViewStates.Pattern);
    }
    setShowPreview(false);
    return setViewState(ViewStates.Blank);
  }, [pattern, customEgg]);

  // MAYBE ONLY IF WAS CREATED?
  useEffect(() => {
    return () => clearEgg();
  }, []);

  const reset = () => {
    clearPattern();
    clearEgg();
  };

  const { name, description } = customEgg;

  const onExport = () => {
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

  return (
    <LayoutFullHeight>
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
        <div className="egg__preview-container">
          <div className="egg__details">
            {!showPreview && (
              <div
                className="egg__pen-wrapper"
                onClick={() => setShowPreview(true)}
              >
                <Pen />
              </div>
            )}
            <canvas
              width={200}
              height={200}
              ref={canvasRef}
              style={{ display: showPreview ? "block" : "none" }}
              id={PREVIEW_CANVAS_ID}
            ></canvas>
            <div>{name}</div>
            <div>{description}</div>
            {customEgg.name && customEgg.description && (
              <Button
                padding="0"
                width="unset"
                height={30}
                name="Edit"
                onClick={() => openModal(ModalTypes.EggMaker)}
                className="anti-state"
              />
            )}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Buttons
            user={user}
            openModal={openModal}
            viewState={viewState}
            inputRef={inputRef}
            reset={reset}
            onExport={onExport}
            uploadPattern={uploadPattern}
            updating={updating}
          />
        </div>
        <EggMask visible={false} svgId={EGGVG} imgId={EGG_MASK} />

        {/* <canvas width={200} height={200} id={REPEAT_CANVAS_ID} style={{ position: "absolute", top: 200, left: 0, border: "1px solid black" }} /> */}
      </div>
      {/* <button style={{ position: "absolute", top: 10, left: 10 }} onClick={() => openModal(ModalTypes.Mint, { metadata: {} })}>export</button> */}
    </LayoutFullHeight>
  );
}
