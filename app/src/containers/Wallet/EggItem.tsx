import { useHistory } from "react-router";
import Button from "../../components/Button";
import Small from "../../components/Egg/Small";
import TagText from "../../components/Text/Tag";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes, WalletState, YaytsoMetaWeb2 } from "../../contexts/types";
import EggImg from "./EggImg";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import DotTyping from "../../components/Loading/DotTyping";

type Props = {
  metadata: YaytsoMetaWeb2;
  wallet: WalletState;
};

export default function EggItem({ metadata, wallet }: Props) {
  const { ref, inView, entry } = useInView({
    threshold: 0,
  });
  const history = useHistory();
  const openModal = useOpenModal();
  const onClick = () => openModal(ModalTypes.Mint, { metadata });
  const navigateToEgg = () => history.push(`/egg/${metadata.svgCID}`);
  const hasWallet = wallet.eth && wallet.address;
  const isNFT = metadata.nft;

  return (
    <div
      className="wallet__egg-wrapper"
      ref={ref}
      style={{ background: "red" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TagText fontSize="1.2rem">
          {metadata.isEggvatar ? "Your eggvatar" : metadata.name}
        </TagText>
      </div>
      {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
      {/* <EggImg cid={metadata.svgCID} navigateToEgg={navigateToEgg} /> */}
      {inView && (
        <div onClick={navigateToEgg}>
          <Small gltfCid={metadata.gltfCID} legacy={false} />
        </div>
      )}
      {/* {!inView && <DotTyping />} */}
      {hasWallet && !isNFT && (
        <Button
          name="Mint"
          className="inverse"
          onClick={onClick}
          margin="20px auto 0px"
          width="30%"
          size="flex"
        />
      )}
      {isNFT && (
        <div
          style={{
            color: "var(--green)",
            fontWeight: "bold",
            fontSize: "3.5rem",
          }}
        >
          NFT
        </div>
      )}
    </div>
  );
}
