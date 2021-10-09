import LayoutFullHeight from "../../components/Layout/FullHeight";
import Egg from "./Egg";
import { useParams, useHistory } from "react-router-dom";

import "../../styles/egg-view.css";

import { useMetaMask, useWalletConnect } from "../../contexts/WalletContext";
import { useUser } from "../../contexts/UserContext";
import { useEffect, useState } from "react";
import {
  useCartonContract,
  useYaytsoContract,
} from "../../contexts/ContractContext";
import { fetchYaytso } from "../../contexts/services";
import Button from "../../components/Button";
import TransactionProcessing, {
  TxStatus,
} from "../../components/TransactionProcessing";
import { useModalToggle, useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes, YaytsoMetaWeb2 } from "../../contexts/types";
import LoadingButton from "../../components/Button/LoadingButton";

import "../../styles/claim.css";

export default function Claim() {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const { signature, boxId, nonce } =
    useParams<{ signature: string; boxId: string; nonce: string }>();
  const history = useHistory();
  const user = useUser();
  const { getTokenOfBox, claimYaytso, txState } = useCartonContract();
  const { getYaytsoURI } = useYaytsoContract();
  const openModal = useOpenModal();
  const [yaytsoUri, setYaytsoUri] = useState("");
  const [yaytsoMeta, setYaytsoMeta] = useState<YaytsoMetaWeb2 | null>(null);
  const onClaim = () => {
    openModal(ModalTypes.Claim, {
      signature,
      boxId,
      nonce,
      gltfCID: yaytsoMeta && yaytsoMeta.gltfCID,
    });
  };

  useEffect(() => {
    setFetching(true);
    getTokenOfBox(parseInt(boxId)).then((tokenId) => {
      if (parseInt(tokenId)) {
        getYaytsoURI(tokenId).then((uri) => {
          const cid = uri.replace("ipfs://", "");
          fetchYaytso(cid).then((yaytso) => {
            // console.log(yaytso.data());
            // setYaytsoUri(yaytso.data()!.svgCID.replace("ipfs://", ""));
            setYaytsoMeta(yaytso.data()! as YaytsoMetaWeb2);
            setFetching(false);
          });
        });
      } else {
        setError("There is no egg in this box!");
      }
    });
  }, []);

  useWalletConnect();
  useMetaMask();
  return (
    <LayoutFullHeight>
      <>{yaytsoMeta && <Egg meta={yaytsoMeta} />}</>
      <>
        {error && (
          <div className="message__container">
            <div>{error}</div>
          </div>
        )}
      </>
      <div className="egg-view__mint-button-container">
        {yaytsoMeta && <Button name="Claim" onClick={onClaim} />}
        {fetching && !error && <LoadingButton color="white" />}
      </div>
    </LayoutFullHeight>
  );
}
