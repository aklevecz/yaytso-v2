import { Fragment } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "../../components/Button";
import TagText from "../../components/Text/Tag";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes, WalletState } from "../../contexts/types";
import { useYaytsoSVGs } from "../../contexts/WalletContext";
import EggImg from "./EggImg";

type Props = {
  wallet: WalletState;
};

const NoEggs = () => (
  <div style={{ fontSize: "1.5rem", width: "70%" }}>
    <div>
      Go to the{" "}
      <Button size="xs" onClick={console.log}>
        <Link style={{ color: "white", textDecoration: "none" }} to="/egg">
          Egg
        </Link>
      </Button>{" "}
      view to make your first Yaytso!
    </div>
  </div>
);

export default function Eggs({ wallet }: Props) {
  const history = useHistory();
  const { yaytsoMeta, metaFetched } = useYaytsoSVGs();
  const openModal = useOpenModal();

  if (!metaFetched) {
    return (
      <div style={{ marginTop: 100 }} className="loading-dot__container">
        <div className="dot-typing-inverse"></div>
      </div>
    );
  }
  return (
    <Fragment>
      <div
        className="wallet__title"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <TagText fontSize="2rem" padding={"10px 20px"}>
          YOUR YAYTSOS
        </TagText>
      </div>
      <div className="wallet__egg-container">
        {yaytsoMeta.length === 0 && <NoEggs />}
        {yaytsoMeta.map((metadata, i) => {
          const onClick = () => openModal(ModalTypes.Mint, { metadata });
          const navigateToEgg = () => history.push(`/egg/${metadata.svgCID}`);
          const hasWallet = wallet.eth && wallet.address;
          const isNFT = metadata.nft;
          return (
            <div key={`yaytso${i}`} className="wallet__egg-wrapper">
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
              <EggImg cid={metadata.svgCID} navigateToEgg={navigateToEgg} />
              {hasWallet && !isNFT && (
                <Button
                  name="Mint"
                  className="inverse"
                  onClick={onClick}
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
        })}
      </div>
    </Fragment>
  );
}
