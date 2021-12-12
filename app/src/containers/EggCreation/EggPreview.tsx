import { forwardRef, useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import Button from "../../components/Button";
import IconButton from "../../components/Button/IconButton";
import CloseIcon from "../../components/icons/CloseIcon";
import Expand from "../../components/icons/Expand";
import Pen from "../../components/icons/Pen";
import Retract from "../../components/icons/Retract";
import { useOpenModal } from "../../contexts/ModalContext";
import { useCanvasPreview, useDraw } from "../../contexts/PatternContext";
import { Egg, ModalTypes } from "../../contexts/types";
import { PREVIEW_CANVAS_ID } from "./constants";
import DrawingTools from "./DrawingTools";

type Props = {
  showPreview: boolean;
  customEgg: Egg;
  openPreview: () => void;
  closePreview: () => void;
};

const DEFAULT_DIMS = 200;

const EggPreview = forwardRef<HTMLCanvasElement, Props>(
  ({ showPreview, customEgg, openPreview, closePreview }, ref) => {
    const [containerDims, setContainerDims] = useState(DEFAULT_DIMS);
    const [expanded, setExpanded] = useState(false);
    const { initCanvas, previewDims } = useCanvasPreview();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const openModal = useOpenModal();

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
              <IconButton
                onClick={closePreview}
                className="egg__preview-close-icon"
              >
                <CloseIcon />
              </IconButton>
              <DrawingTools />
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
