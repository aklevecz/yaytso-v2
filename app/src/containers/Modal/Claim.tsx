import { useState } from "react";
import { useHistory } from "react-router";
import Button from "../../components/Button";
import Small from "../../components/Egg/Small";
import TransactionProcessing, {
  TxStatus,
} from "../../components/TransactionProcessing";
import { useCartonContract } from "../../contexts/ContractContext";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";

enum View {
  Initial,
  Completed,
}

export default function Claim() {
  const history = useHistory();
  const { toggleModal } = useModalToggle();
  const [view, setView] = useState<View>(View.Initial);
  const { getTokenOfBox, claimYaytso, txState } = useCartonContract();
  const {
    data: { signature, boxId, nonce, gltfCID },
  } = useModalData();

  const onClaim = () => {
    claimYaytso(signature, boxId, nonce, () => setView(View.Completed));
  };

  const onYay = () => {
    toggleModal();
    history.push("/wallet");
  };
  return (
    <div>
      {view === View.Initial && (
        <>
          {txState === 0 && <div className="modal__title">Claim yaytso?</div>}
          <div className="modal__block">
            {txState ? (
              <TransactionProcessing
                status={(txState - 1) as unknown as TxStatus}
                next={toggleModal}
              />
            ) : (
              ""
            )}
            {txState === 0 && <Small gltfCid={gltfCID} />}
          </div>
          <div className="modal__button-container">
            {txState === 0 && <Button name="Claim" onClick={onClaim} />}
          </div>
        </>
      )}
      {view === View.Completed && (
        <>
          <div className="modal__title">YAYY</div>
          <div className="modal__block" style={{ flexDirection: "column" }}>
            <div>This is now your egg!</div>
            <Small gltfCid={gltfCID} />
          </div>
          <div className="modal__button-container">
            <Button name="Yay!" onClick={onYay} />
          </div>
        </>
      )}
    </div>
  );
}
