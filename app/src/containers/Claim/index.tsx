import LayoutFullHeight from "../../components/Layout/FullHeight";
import Egg from "./Egg";
import { useParams, useHistory } from "react-router-dom";

import "../../styles/egg-view.css";

import {
  useMetaMask,
  useWallet,
  useWalletConnect,
} from "../../contexts/WalletContext";
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
import { useCartonInfo } from "../../contexts/CartonContext";
import { useUserLocation } from "../../contexts/MapContext";
import { haversineDistance } from "../../utils";

const CLAIMABLE_DISTANCE_M = 10;

export default function Claim() {
  const [fetching, setFetching] = useState(false);
  const [claimable, setClaimable] = useState<undefined | boolean>(undefined);
  const [error, setError] = useState("");
  const { signature, boxId, nonce } =
    useParams<{ signature: string; boxId: string; nonce: string }>();
  const history = useHistory();
  const user = useUser();
  const { userLocation, getUserLocation } = useUserLocation();
  const { wallet } = useWallet();
  const { getTokenOfBox, claimYaytso, txState } = useCartonContract();
  const { carton } = useCartonInfo({ cartonId: parseInt(boxId) });
  const { getYaytsoURI } = useYaytsoContract();
  const openModal = useOpenModal();
  const [yaytsoUri, setYaytsoUri] = useState("");
  const [yaytsoMeta, setYaytsoMeta] = useState<YaytsoMetaWeb2 | null>(null);

  const onClaim = () => {
    if (!wallet.address) {
      openModal(ModalTypes.ConnectWallet);
    } else {
      openModal(ModalTypes.Claim, {
        signature,
        boxId,
        nonce,
        metadata: yaytsoMeta,
        gltfCID: yaytsoMeta && yaytsoMeta.gltfCID,
        metaCID: yaytsoMeta && yaytsoMeta.metaCID,
        legacy: yaytsoMeta && yaytsoMeta.legacy,
      });
    }
  };

  useEffect(() => {
    getUserLocation();
    setFetching(true);
    getTokenOfBox(parseInt(boxId)).then((tokenId) => {
      if (parseInt(tokenId)) {
        getYaytsoURI(tokenId).then((uri) => {
          const cid = uri.replace("ipfs://", "");
          fetchYaytso(cid).then((yaytso) => {
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

  useEffect(() => {
    if (carton && carton.lat && userLocation.lat) {
      const d = haversineDistance(
        { lat: parseFloat(carton.lat), lng: parseFloat(carton.lng) },
        userLocation
      );
      setClaimable(d < CLAIMABLE_DISTANCE_M);
    }
  }, [userLocation, carton]);

  useWalletConnect();
  useMetaMask();
  console.log(claimable);
  // Refactor the button container -- absolute positioning is weird
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
      <div style={{ width: 300 }} className="egg-view__mint-button-container">
        {yaytsoMeta && claimable && (
          <Button size="s" name="Claim" onClick={onClaim} />
        )}
        {yaytsoMeta && !claimable && claimable !== undefined && (
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            You are too far away to claim!
          </div>
        )}
        {(fetching && !error) ||
          (claimable === undefined && <LoadingButton color="white" />)}
      </div>
    </LayoutFullHeight>
  );
}
