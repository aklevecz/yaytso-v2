import { forwardRef, useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import Button from "../../components/Button";
import IconButton from "../../components/Button/IconButton";
import Expand from "../../components/icons/Expand";
import Pen from "../../components/icons/Pen";
import Retract from "../../components/icons/Retract";
import { useOpenModal } from "../../contexts/ModalContext";
import { useCanvasPreview, useDraw } from "../../contexts/PatternContext";
import { Egg, ModalTypes } from "../../contexts/types";
import { PREVIEW_CANVAS_ID } from "./constants";

type Props = {
  showPreview: boolean;
  customEgg: Egg;
  openPreview: () => void;
};

const DEFAULT_DIMS = 200;

const EggPreview = forwardRef<HTMLCanvasElement, Props>(
  ({ showPreview, customEgg, openPreview }, ref) => {
    const [containerDims, setContainerDims] = useState(DEFAULT_DIMS);
    const [expanded, setExpanded] = useState(false);
    const { initCanvas, previewDims } = useCanvasPreview();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const openModal = useOpenModal();

    const { lineWidth, updateLineWidth, color, updateColor } = useDraw();

    const toggleExpanded = () => setExpanded(!expanded);

    useEffect(() => {
      if (canvasRef && canvasRef.current) {
        initCanvas(canvasRef.current);
      }
    }, []);

    useEffect(() => {
      if (expanded) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const dim = windowWidth > windowHeight ? windowHeight : windowWidth;
        setContainerDims(dim * 0.9);
      } else {
        setContainerDims(DEFAULT_DIMS);
      }
    }, [expanded]);

    // Might not be necessary now that im moving dims to the container
    useEffect(() => {
      if (canvasRef && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, previewDims.w, previewDims.h);
      }
    }, [previewDims]);

    const { name, description } = customEgg;
    return (
      <div
        className="egg__preview-container"
        style={{ width: containerDims, height: containerDims }}
      >
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
            <>
              <IconButton onClick={toggleExpanded} id="expand-button">
                {!expanded ? <Expand /> : <Retract />}
              </IconButton>

              <div>
                <SketchPicker
                  color={color}
                  onChange={(color) => updateColor(color.hex)}
                />
                {[10, 20, 30, 40].map((brush) => (
                  <div
                    key={brush}
                    style={{
                      margin: "10px auto",
                      width: brush,
                      height: brush,
                      background: lineWidth === brush ? "red" : "black",
                      borderRadius: "50%",
                    }}
                    onClick={() => updateLineWidth(brush)}
                  />
                ))}
              </div>
            </>
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
