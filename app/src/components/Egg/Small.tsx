import { useEffect, useRef, useState } from "react";
import DotTyping from "../../components/Loading/DotTyping";
import {
  ThreeProvider,
  useGltfCid,
  useThreeScene,
} from "../../contexts/ThreeContext";
import { YaytsoMetaWeb2 } from "../../contexts/types";

const Scene = ({
  metadata,
  gltfCid,
  legacy,
}: {
  metadata: YaytsoMetaWeb2;
  gltfCid: string;
  legacy: boolean;
}) => {
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const { initScene } = useThreeScene();
  // const { metadata, entities } = useFetchedYaytso(eggId);
  // TODO ADD LOGIC FOR SMALL LEGACY EGG
  const { loaded, entities } = useGltfCid(metadata, gltfCid, legacy);
  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }

    const cleanup = initScene(sceneContainer.current, true, true);

    return () => cleanup();
  }, []);

  // if (!loaded) {
  //   return <DotTyping />;
  // }

  return (
    <div className="egg-view__container">
      <div
        className="egg-view__canvas__container"
        ref={sceneContainer}
        style={{ alignItems: "unset", paddingTop: 27 }}
      />
      {/* REFACTOR SUPER jANK */}
      {entities.length === 0 && (
        <div
          className="loading-dot__container"
          style={{ position: "absolute", top: "0%", right: "50%" }}
        >
          <div className="dot-typing-inverse"></div>
        </div>
      )}
    </div>
  );
};

// This is the meta data for some reason should be id and fetch from the blockchain
export default function Small({
  metadata,
  gltfCid,
  legacy,
}: {
  metadata: YaytsoMetaWeb2;
  gltfCid: string;
  legacy: boolean;
}) {
  const [wait, setWait] = useState(true);
  useEffect(() => {
    setTimeout(() => setWait(false), 2000);
  }, []);
  return (
    <ThreeProvider>
      <>
        {wait && (
          <div style={{ height: 267 }}>
            <DotTyping />
          </div>
        )}
      </>
      <>
        {" "}
        {!wait && (
          <Scene metadata={metadata} gltfCid={gltfCid} legacy={legacy} />
        )}
      </>
    </ThreeProvider>
  );
}
