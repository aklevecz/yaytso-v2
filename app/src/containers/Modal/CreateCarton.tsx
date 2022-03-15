import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Gear from "../../components/icons/Gear";
import Pen from "../../components/icons/Pen";
import Carton from "../../components/icons/Carton";
import { useCartonContract } from "../../contexts/ContractContext";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";
import { Position } from "../../contexts/types";
import {
  useMetaMask,
  useWallet,
  useWalletConnect,
} from "../../contexts/WalletContext";
import { BiAnim } from "./Transitions";
import LoadingButton from "../../components/Button/LoadingButton";
import { useUserLocation } from "../../contexts/MapContext";

const CTA = () => (
  <div>
    <div className="modal__title">Create a carton</div>
    <div className="modal__block">Would you like to make a carton?</div>
  </div>
);

const Location = ({ position }: { position: Position }) => (
  <div>
    <div className="modal__title">You are about to create a carton at:</div>
    <div className="modal__block">
      <div
        style={{
          display: "flex",
          width: "100%",
          fontWeight: "bold",
          justifyContent: "space-around",
          fontSize: "2rem",
          color: "#5ce191",
        }}
      >
        <div>{position.lat && position.lat.toFixed(2)}</div>
        <div>{position.lng && position.lng.toFixed(2)}</div>
      </div>
    </div>
  </div>
);

export enum TxStatus {
  Waiting,
  Minting,
  Completed,
  Failed,
}
const txStates = {
  [TxStatus.Waiting]: "Waiting for signature",
  [TxStatus.Minting]: "Creating...",
  [TxStatus.Completed]: "Completed!",
  [TxStatus.Failed]: "Failed!",
};
const txDescriptions = {
  [TxStatus.Waiting]:
    "You must sign this transaction using MetaMask or the wallet you connected!",
  [TxStatus.Minting]:
    "Your Carton is on its way through the blockchain! This may take awhile though...",
  [TxStatus.Completed]: "",
  [TxStatus.Failed]: "",
};
const txIcons = {
  [TxStatus.Waiting]: <Pen fill="black" />,
  [TxStatus.Minting]: <Gear />,
  [TxStatus.Completed]: <Carton />,
  [TxStatus.Failed]: <></>,
};
const txAnimations = {
  [TxStatus.Waiting]: { x: 10, y: 5 },
  [TxStatus.Minting]: { rotate: 360 },
  [TxStatus.Completed]: {},
  [TxStatus.Failed]: {},
};

const Minting = ({ status }: { status: TxStatus }) => {
  const txStatus = txStates[status];
  let icon = txIcons[status];
  const description = txDescriptions[status];
  const animation = txAnimations[status];
  return (
    <div>
      <div
        style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold" }}
      >
        {txStatus}
      </div>
      <div className="modal__description">{description}</div>
      <motion.div
        className="mint__icon-container"
        style={{ originX: "50%", originY: "40%", margin: "35px 0px 10px" }}
        animate={animation}
        transition={{
          ease: "easeInOut",
          duration: 1,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
};

enum Steps {
  CTA,
  Location,
  Minting,
  Completed,
}

export default function CreateCarton() {
  const {
    data: { goToCreateView, givenStep, position, reset },
  } = useModalData();
  const [step, setStep] = useState(givenStep ? givenStep : Steps.CTA);
  const [txStatus, setTxStats] = useState<TxStatus | null>(null);
  const { toggleModal, closeModal, modalState } = useModalToggle();
  // const { userLocation: pos } = useUserLocation();
  useWalletConnect();
  useMetaMask();
  const { wallet } = useWallet();
  const { createBox } = useCartonContract();
  useEffect(() => {
    givenStep && setStep(givenStep);
  }, [givenStep]);

  const updateStatus = (status: TxStatus) => {
    setTxStats(status);
    if (status === TxStatus.Completed) {
      setStep(Steps.Completed);
      reset();
    }
  };

  const ok = () => {
    if (wallet.signer) {
      if (step === Steps.CTA) {
        goToCreateView();
        toggleModal();
      }
      if (step === Steps.Location) {
        createBox(position.lat, position.lng, updateStatus);
        setStep(Steps.Minting);
        // toggleModal();
      }
    } else {
      alert("You must connect a wallet to create a carton");
      toggleModal();
    }
  };

  return (
    <div>
      <BiAnim state={modalState} changeView={() => setStep(modalState)}>
        <div className="modal__block">
          {step === Steps.CTA && <CTA />}
          {step === Steps.Location && <Location position={position} />}
          {(step === Steps.Minting || step === Steps.Completed) &&
            txStatus !== null && <Minting status={txStatus} />}
        </div>
      </BiAnim>
      {step < Steps.Minting && (
        <div className="modal__button-container">
          <Button name="No" onClick={toggleModal} />
          <Button name="Ok" onClick={ok} />
        </div>
      )}
      {step === Steps.Minting && (
        <div className="modal__button-container">
          <LoadingButton color="white" />
        </div>
      )}
      {step === Steps.Completed && (
        <div className="modal__button-container">
          <Button
            name="Ok"
            onClick={() => {
              closeModal();
              setStep(Steps.CTA);
            }}
          />
        </div>
      )}
    </div>
  );
}
// I love Ari :-) <33333
