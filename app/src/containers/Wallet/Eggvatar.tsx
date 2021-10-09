import { useState } from "react";
import { ipfsLink } from "../../utils";

type Props = {
  cid: string;
};

export default function Eggvatar({ cid }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div
          style={{ height: 100, margin: "50px auto" }}
          className="loading-dot__jank-container"
        >
          <div className="dot-typing"></div>
        </div>
      )}
      <img
        src={ipfsLink(cid)}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? "block" : "none" }}
      />
    </>
  );
}
