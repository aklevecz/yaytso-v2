import { motion } from "framer-motion";
import Button from "../Button";
import LoadingButton from "../Button/LoadingButton";
import Carton from "../icons/Carton";
import Gear from "../icons/Gear";
import Pen from "../icons/Pen";
import Smiler from "../icons/Smiler";

export enum TxStatus {
  Waiting,
  Minting,
  Completed,
  Failed,
}

type Props = {
  status: TxStatus;
  next: () => void;
};

const txStates = {
  [TxStatus.Waiting]: "Waiting for signature",
  [TxStatus.Minting]: "...",
  [TxStatus.Completed]: "Completed!",
  [TxStatus.Failed]: "Failed!",
};
const txDescriptions = {
  [TxStatus.Waiting]:
    "You must sign this transaction using MetaMask or the wallet you connected!",
  [TxStatus.Minting]:
    "Your transaction is on its way through the blockchain! This may take awhile though...",
  [TxStatus.Completed]: "",
  [TxStatus.Failed]: "",
};
const txIcons = {
  [TxStatus.Waiting]: <Pen />,
  [TxStatus.Minting]: <Gear />,
  [TxStatus.Completed]: <Smiler />,
  [TxStatus.Failed]: <></>,
};
const txAnimations = {
  [TxStatus.Waiting]: { x: 10, y: 5 },
  [TxStatus.Minting]: { rotate: 360 },
  [TxStatus.Completed]: {},
  [TxStatus.Failed]: {},
};

export default function TransactionProcessing({ status, next }: Props) {
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
      <div className="modal__button-container">
        {status < TxStatus.Completed ? (
          <LoadingButton color="white" />
        ) : (
          <Button name="Ok!" onClick={next} />
        )}
      </div>
    </div>
  );
}
