import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import EggMask from "../../components/Mask/Egg";
import TagText from "../../components/Text/Tag";
import { useModalToggle, useModalData } from "../../contexts/ModalContext";
import { createEggMask } from "../../contexts/utils";
import { EGGVG } from "../EggCreation/constants";

export default function ExportReceipt() {
  const [egg, setEgg] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toggleModal, open } = useModalToggle();
  const {
    data: { name, description, canvas, repetitions },
  } = useModalData();
  const history = useHistory();
  useEffect(() => {
    if (open) {
      const eggMask = document.getElementById("eggMask2") as HTMLImageElement;
      createEggMask(
        eggMask,
        canvas,
        // canvas.width,
        // canvas.height,
        1080,
        1080,
        repetitions,
        (eggCanvas: any) => {
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext("2d")!;
          // ctx.fillStyle = "red";
          // ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            eggCanvas,
            0,
            0,
            eggCanvas.width,
            eggCanvas.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      );
    }
  }, [open]);

  const done = () => {
    toggleModal();
    history.push("/wallet");
  };
  return (
    <div>
      {/* <div className="modal__title">Your Beautiful Egg</div> */}
      <div
        className="modal__block columns"
        style={{
          position: "relative",
          textAlign: "center",
          margin: 20,
          padding: 10,
        }}
      >
        <TagText>{name}</TagText>
        {/* <div className="egg-container" style={{ width: "100%" }} /> */}
        {/* <EggMask visible={true} svgId={EGGVG + "2"} imgId={"eggMask2"} /> */}
        <canvas
          width="1080"
          height="1080"
          id="export-canvas-preview"
          ref={canvasRef}
        />
        <TagText>{description}</TagText>
      </div>
      <div className="modal__button-container">
        <Button name="Ok" onClick={done} />
      </div>
    </div>
  );
}
