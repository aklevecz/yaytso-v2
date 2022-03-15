import localforage from "localforage";
import { useEffect, useRef, useState } from "react";
import { ipfsLink } from "../../utils";

type Props = {
  cid: string;
  name: string;
  navigateToEgg: () => void;
};

export default function EggImg({ cid, name, navigateToEgg }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const eggId = `egg${name}`;
    localforage.getItem(eggId).then((blob: any) => {
      if (imgRef.current) {
        if (blob) {
          setLoaded(true);
          imgRef.current.src = URL.createObjectURL(blob);
        } else {
          fetch(ipfsLink(cid))
            .then((r) => r.text())
            .then((svgString) => {
              const blob = new Blob([svgString], { type: "image/svg+xml" });
              imgRef.current!.src = URL.createObjectURL(blob);
              localforage.setItem(eggId, blob);
            });
        }
      }
    });
  }, []);
  return (
    <>
      {!loaded && (
        <div className="loading-dot__jank-container">
          <div className="dot-typing"></div>
        </div>
      )}
      <img
        ref={imgRef}
        onClick={navigateToEgg}
        // src={ipfsLink(cid)}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? "block" : "none" }}
      />
    </>
  );
}
