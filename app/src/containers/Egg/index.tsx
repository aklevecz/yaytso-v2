import { useEffect, useRef, Fragment } from "react";
import { useThreeScene, useFetchedYaytso } from "../../contexts/ThreeContext";
import { useOpenModal } from "../../contexts/ModalContext";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import { useParams, useHistory } from "react-router-dom";
import Button from "../../components/Button";

import "../../styles/egg-view.css";
import { ModalTypes } from "../../contexts/types";
import DotTyping from "../../components/Loading/DotTyping";
import { deleteYaytso } from "../../contexts/services";
import { useMetaMask, useWalletConnect } from "../../contexts/WalletContext";
import { useUser } from "../../contexts/UserContext";

export default function Egg() {
  const { eggId } = useParams<{ eggId: string }>();
  const history = useHistory();
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const { initScene } = useThreeScene();
  const { metadata, entities } = useFetchedYaytso(eggId);
  const user = useUser();
  const openModal = useOpenModal();
  useWalletConnect();
  useMetaMask();

  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }
    if (!metadata) {
      return;
    }

    const cleanup = initScene(sceneContainer.current, true);

    return () => cleanup();
  }, [initScene, metadata]);

  const onClick = () => openModal(ModalTypes.Mint, { metadata });
  const openEggInfo = () => openModal(ModalTypes.EggInfo, { metadata });

  if (!metadata) {
    return <DotTyping />;
  }
  const isOwner = metadata.uid === user.uid;
  const eggName =
    isOwner && metadata.name == user.uid ? "Your Eggvatar" : metadata.name;
  // Confirmation modal
  // Deletes it from NFT storage? (that is probably an API call)
  const deleteEgg = () => {
    const action = () => {
      deleteYaytso(metadata.metaCID).then((success) => {
        if (success) {
          history.push("/wallet");
        } else {
          alert("Oops something went wrong!");
        }
      });
    };
    openModal(ModalTypes.ConfirmAction, {
      action,
      prompt: "you want to delete this yaytso?",
    });
  };
  console.log(metadata);
  return (
    <LayoutFullHeight>
      <div className="egg-view__container">
        <div className="egg-view__name">{eggName}</div>
        <button className="info-button" onClick={openEggInfo}>
          i
        </button>
        <div
          className="egg-view__canvas__container"
          ref={sceneContainer}
          style={{ alignItems: "unset", paddingTop: 27 }}
        />
        {/* REFACTOR SUPER jANK */}
        {entities.length === 0 && (
          <div
            className="loading-dot__container"
            style={{ position: "absolute", top: "0%", right: "50%" }}
          >
            <div className="dot-typing-inverse"></div>
          </div>
        )}
        <div className="egg-view__description">
          {metadata && metadata.description}
        </div>
        <div className="egg-view__mint-button-container">
          {metadata && !metadata.nft && isOwner && (
            <Fragment>
              <Button
                name="Mint into NFT"
                className="flex3"
                onClick={onClick}
              />
              <Button
                name="Delete"
                className="flex3 danger"
                onClick={deleteEgg}
              />
            </Fragment>
          )}
          {metadata && metadata.nft && (
            <div
              style={{
                color: "white",
                background: "black",
                fontWeight: "bold",
                fontSize: "2.5rem",
                width: "80%",
                textAlign: "center",
                padding: 12,
                maxWidth: 200,
              }}
            >
              NFT
            </div>
          )}
        </div>
      </div>
    </LayoutFullHeight>
  );
}
