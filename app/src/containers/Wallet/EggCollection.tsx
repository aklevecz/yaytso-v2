import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import TagText from "../../components/Text/Tag";
import { WalletState, YaytsoMetaWeb2 } from "../../contexts/types";
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
    <div style={{ textAlign: "center" }}>
      You are without eggs. Click the button below to begin
      <Button
        margin="20px auto 0px"
        display="block"
        size="flex2"
        fontSize="1.2rem"
        className="inverse"
        onClick={() => {}}
      >
        <Link style={{ textDecoration: "none" }} to="/egg">
          Go Make a Freaking Egg
        </Link>
      </Button>{" "}
    </div>
  </div>
);

const PAGE_LIMIT = 5;
export default function Eggs({ wallet }: Props) {
  const { yaytsoMeta, metaFetched } = useYaytsoSVGs();
  const [page, setPage] = useState(0);
  const [yaytsos, setYaytsos] = useState<YaytsoMetaWeb2[]>([]);

  const nextPage = () => setPage(page + 1);
  useEffect(() => {
    const yaytsos = yaytsoMeta.slice(0, page * PAGE_LIMIT + PAGE_LIMIT);
    setYaytsos(yaytsos);
  }, [page, yaytsoMeta]);

  if (!metaFetched) {
    return (
      <div style={{ marginTop: 100 }} className="loading-dot__container">
        <div className="dot-typing-inverse"></div>
      </div>
    );
  }
  const hasEggs = yaytsos.length > 0;
  return (
    <Fragment>
      <div
        className="wallet__title"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <TagText fontSize="2rem" padding={"10px 20px"}>
          яйцо
        </TagText>
      </div>
      <div className="wallet__egg-container">
        {!hasEggs && <NoEggs />}
        {yaytsos.map((metadata, i) => {
          return (
            <EggItem key={`yaytso${i}`} metadata={metadata} wallet={wallet} />
          );
        })}
      </div>{" "}
      {hasEggs && yaytsoMeta.length !== yaytsos.length && (
        <Button margin="40px auto" display="block" onClick={nextPage}>
          See more
        </Button>
      )}
    </Fragment>
  );
}
