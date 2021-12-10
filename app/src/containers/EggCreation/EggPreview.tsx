import { forwardRef, useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import Pen from "../../components/icons/Pen";
import { useOpenModal } from "../../contexts/ModalContext";
import { useCanvasPreview } from "../../contexts/PatternContext";
import { Egg, ModalTypes } from "../../contexts/types";
import { PREVIEW_CANVAS_ID } from "./constants";

type Props = {
  showPreview: boolean;
  customEgg: Egg;
  openPreview: () => void;
};

const EggPreview = forwardRef<HTMLCanvasElement, Props>(
  ({ showPreview, customEgg, openPreview }, ref) => {
    const { initCanvas, previewDims, toggleFullscreen } = useCanvasPreview();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const openModal = useOpenModal();

    useEffect(() => {
      if (canvasRef && canvasRef.current) {
        initCanvas(canvasRef.current);
      }
    }, []);

    useEffect(() => {
      if (canvasRef && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, previewDims.w, previewDims.h);
      }
    }, [previewDims]);

    const { name, description } = customEgg;
    return (
      <div className="egg__preview-container">
        <div className="egg__details">
          {!showPreview && (
            <div className="egg__pen-wrapper" onClick={openPreview}>
              <Pen />
            </div>
          )}
          <canvas
            width={previewDims.w}
            height={previewDims.h}
            ref={canvasRef}
            style={{ display: showPreview ? "block" : "none" }}
            id={PREVIEW_CANVAS_ID}
          ></canvas>
          {showPreview && (
            <button onClick={toggleFullscreen}>Fullscreen</button>
          )}
          <div>{name}</div>
          <div>{description}</div>
          {name && description && (
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
    );
  }
);

export default EggPreview;
