import { useEffect, useRef, useState } from "react";
import DotTyping from "../../components/Loading/DotTyping";
import {
  ThreeProvider,
  useFetchedYaytso,
  useGltfCid,
  useThreeScene,
} from "../../contexts/ThreeContext";
import { YaytsoMetaWeb2 } from "../../contexts/types";

const Scene = ({ gltfCid, legacy }: { gltfCid: string; legacy: boolean }) => {
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const { initScene } = useThreeScene();
  // const { metadata, entities } = useFetchedYaytso(eggId);
  // TODO ADD LOGIC FOR SMALL LEGACY EGG
  const { loaded, entities } = useGltfCid(gltfCid, legacy);
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
  gltfCid,
  legacy,
}: {
  gltfCid: string;
  legacy: boolean;
}) {
  const [wait, setWait] = useState(true);
  useEffect(() => {
    setTimeout(() => setWait(false), 2000);
  }, []);
  console.log(wait, "WAITING");
  return (
    <ThreeProvider>
      <>
        {wait && (
          <div style={{ height: 200 }}>
            <DotTyping />
          </div>
        )}
      </>
      <> {!wait && <Scene gltfCid={gltfCid} legacy={legacy} />}</>
    </ThreeProvider>
  );
}
