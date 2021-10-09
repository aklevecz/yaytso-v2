import { useEffect, useRef, useState } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../assets/loading-anim.json";
import Button from "../../components/Button";
import Small from "../../components/Egg/Small";
import { useCartonInfo } from "../../contexts/CartonContext";
import {
  useModalData,
  useModalToggle,
  useOpenModal,
} from "../../contexts/ModalContext";
import { updateCarton } from "../../contexts/services";
import { ModalTypes } from "../../contexts/types";
import { fadeIn } from "../../contexts/utils";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function CartonContent() {
  const [img, setImg] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const { toggleModal, closeModal } = useModalToggle();
  const { data } = useModalData();
  const { isLocked, yaytso, getYaytsoImage, isOwner } = useCartonInfo(data);

  const openModal = useOpenModal();

  // const fetchYaytsoImg = async () => {
  //   const yaytosImg = await getYaytsoImage();
  //   if (yaytosImg) {
  //     setImg(yaytosImg);
  //   }
  // };

  useEffect(() => {
    setImg("");
    if (!yaytso) {
      return console.log("loading...");
    }
    // fetchYaytsoImg();
    // Should be server side or something
    isLocked(data.cartonId).then((locked) => {
      if (!locked) {
        updateCarton(data.cartonId, { locked, yaytsoId: 0 });
        closeModal();
      }
    });

    if (yaytso && viewRef.current) {
      const view = viewRef.current as HTMLDivElement;
      fadeIn(view);
    }
  }, [data, yaytso]);

  const loading = !yaytso;
  if (yaytso) {
    console.log(yaytso.id <= 42);
  }
  // if (!yaytso || !img) {
  //   return (
  //     <div style={{ height: "100%" }}>
  //       <div className="modal__title">Loading...</div>
  //       <Lottie options={defaultOptions} height={"100%"} width={"100%"} />
  //     </div>
  //   );
  // }
  return (
    <>
      {loading && (
        <div style={{ height: "100%" }}>
          <div className="modal__title">Loading...</div>
          <Lottie options={defaultOptions} height={"90%"} width={"90%"} />
        </div>
      )}
      {/* <div className={"yaytso-view"} ref={viewRef}> */}
      {!loading && (
        <>
          <div
            className="modal__title"
            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {yaytso && yaytso.name}
          </div>
          <div className="modal__block">
            {yaytso && (
              <Small
                gltfCid={yaytso.animation_url.replace("ipfs://", "")}
                legacy={yaytso.id <= 42}
              />
            )}
            {/* {img && (
                <div
                  className="modal__svg-container"
                  dangerouslySetInnerHTML={{ __html: img }}
                />
              )} */}
            {/* <div className="modal__description">
                {yaytso && yaytso.description}
              </div> */}
          </div>
          <div className="modal__button-container">
            <Button name="Ok" onClick={toggleModal} />
            {isOwner && (
              <Button
                name="Make QR"
                onClick={() =>
                  openModal(ModalTypes.FillCarton, {
                    cartonId: data.cartonId,
                    yaytso,
                    skip: "SIGNATURE",
                  })
                }
              />
            )}
          </div>
        </>
      )}
      {/* </div> */}
    </>
  );
}
