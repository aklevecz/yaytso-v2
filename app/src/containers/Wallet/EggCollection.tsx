import { Fragment } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import TagText from "../../components/Text/Tag";
import { WalletState } from "../../contexts/types";
import { useYaytsoSVGs } from "../../contexts/WalletContext";
import EggItem from "./EggItem";

type Props = {
  wallet: WalletState;
};

const NoEggs = () => (
  <div
    className="wallet__container-no-egg"
    style={{ fontSize: "1.5rem", width: "70%" }}
  >
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
  const { yaytsoMeta, metaFetched } = useYaytsoSVGs();

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
          return (
            <EggItem key={`yaytso${i}`} metadata={metadata} wallet={wallet} />
          );
        })}
      </div>
    </Fragment>
  );
}
