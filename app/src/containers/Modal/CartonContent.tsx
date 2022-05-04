import { useEffect, useRef, useState } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../assets/loading-anim.json";
import Button from "../../components/Button";
import Small from "../../components/Egg/Small";
import { useCartonInfo } from "../../contexts/CartonContext";
import { useUserLocation, useUserPosition } from "../../contexts/MapContext";
import {
  useModalData,
  useModalToggle,
  useOpenModal,
} from "../../contexts/ModalContext";
import { updateCarton } from "../../contexts/services";
import { ModalTypes } from "../../contexts/types";
import { fadeIn } from "../../contexts/utils";
import { haversineDistance } from "../../utils";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

enum HowClose {
  Far,
  Close,
  Claimable,
}

const closeMap = {
  [HowClose.Far]: "You are far from this egg",
  [HowClose.Close]: "You are getting close to this egg!",
  [HowClose.Claimable]:
    "You are so close to the egg! Find the poster with the claim QR code!",
};

const colorMap = {
  [HowClose.Far]: "red",
  [HowClose.Close]: "orange",
  [HowClose.Claimable]: "lime",
};

const MAX_DISTANCE_M = 50;

export default function CartonContent() {
  const [img, setImg] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const { toggleModal, closeModal, open } = useModalToggle();
  const { data } = useModalData();
  const { isLocked, yaytso, getYaytsoImage, isOwner } = useCartonInfo(data);
  const userLocation = useUserPosition();

  const [isClose, setIsClose] = useState<undefined | HowClose>(undefined);

  const openModal = useOpenModal();

  // const fetchYaytsoImg = async () => {
  //   const yaytosImg = await getYaytsoImage();
  //   if (yaytosImg) {
  //     setImg(yaytosImg);
  //   }
  // };
  useEffect(() => {
    if (!open) {
      return;
    }
    const distance = haversineDistance(userLocation, data.position) - 5;
    if (distance > MAX_DISTANCE_M + MAX_DISTANCE_M * 3) {
      setIsClose(HowClose.Far);
    }
    if (distance < MAX_DISTANCE_M + MAX_DISTANCE_M * 2) {
      setIsClose(HowClose.Close);
    }
    if (distance < MAX_DISTANCE_M) {
      setIsClose(HowClose.Claimable);
    }
  }, [userLocation, data, open]);

  useEffect(() => {
    setImg("");
    if (!yaytso) {
      return console.log("loading...");
    }
    // fetchYaytsoImg();
    // Should be server side or something
    isLocked(data.cartonId).then((locked) => {
      if (!locked) {
        console.log("is not locked so updating");
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
  }
  // if (!yaytso || !img) {
  //   return (
  //     <div style={{ height: "100%" }}>
  //       <div className="modal__title">Loading...</div>
  //       <Lottie options={defaultOptions} height={"100%"} width={"100%"} />
  //     </div>
  //   );
  // }

  const onOk = () => {
    toggleModal();
    // They would need to find the carton QR code
    // unless there are cartons that don't need to be physically found
    // and the complete signature is server side

    // if (isClose) {
    //   openModal(ModalTypes.Claim, {
    //     signature,
    //     boxId,
    //     nonce,
    //     gltfCID: yaytsoMeta && yaytsoMeta.gltfCID,
    //     metaCID: yaytsoMeta && yaytsoMeta.metaCID,
    //     legacy: yaytsoMeta && yaytsoMeta.legacy,
    //   });
    // }
  };
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
                metadata={yaytso}
                gltfCid={yaytso.animation_url.replace("ipfs://", "")}
                // legacy={yaytso.id <= 42}
                legacy={false}
              />
            )}
          </div>
          <div className="modal__block">
            <span
              style={{
                padding: 10,
                background: "black",
                color: isClose !== undefined ? colorMap[isClose] : "bloack",
              }}
            >
              {isClose !== undefined && closeMap[isClose]}
            </span>
          </div>
          <div className="modal__button-container">
            <Button name="Ok" onClick={onOk} />
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
