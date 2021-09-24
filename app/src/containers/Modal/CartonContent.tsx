import { useEffect, useRef, useState } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../assets/loading-anim.json";
import Button from "../../components/Button";
import { useCartonInfo } from "../../contexts/CartonContext";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";
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
  const { toggleModal } = useModalToggle();
  const { data } = useModalData();
  const { isLocked, yaytso, getYaytsoImage } = useCartonInfo(data);

  const fetchYaytsoImg = async () => {
    const yaytosImg = await getYaytsoImage();
    if (yaytosImg) {
      setImg(yaytosImg);
    }
  };

  useEffect(() => {
    setImg("");
    if (!yaytso) {
      return console.log("loading...");
    }
    fetchYaytsoImg();

    if (yaytso && viewRef.current) {
      const view = viewRef.current as HTMLDivElement;
      fadeIn(view);
    }
  }, [data, yaytso]);

  const loading = !yaytso || !img;

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
      <div className={"yaytso-view"} ref={viewRef}>
        {!loading && (
          <>
            <div className="modal__title">
              <div>{yaytso && yaytso.name}</div>
            </div>
            <div className="modal__block">
              {img && (
                <div
                  className="modal__svg-container"
                  dangerouslySetInnerHTML={{ __html: img }}
                />
              )}
              <div className="modal__description">
                {yaytso && yaytso.description}
              </div>
            </div>
            <div className="modal__button-container">
              <Button name="Ok" onClick={toggleModal} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
