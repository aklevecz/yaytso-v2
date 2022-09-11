import localforage from "localforage";
import { useEffect, useRef, useState } from "react";
import { delay } from "../../contexts/utils";
import { ipfsLink } from "../../utils";

type Props = {
  cid: string;
  name: string;
  navigateToEgg: () => void;
  listIndex: number;
};

export default function EggImg({ cid, name, navigateToEgg, listIndex }: Props) {
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
          delay(0 * listIndex, () => {}).then(() => {
            // fetch(ipfsLink(cid))
            fetch(`https://ipfs.io/ipfs/${cid}`)
              .then((r) => r.text())
              .then((svgString) => {
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                imgRef.current!.src = URL.createObjectURL(blob);
                localforage.setItem(eggId, blob);
              });
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
