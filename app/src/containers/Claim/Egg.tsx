import { useEffect, useRef } from "react";
import DotTyping from "../../components/Loading/DotTyping";
import {
  useFetchedYaytso,
  useGltfCid,
  useThreeScene,
} from "../../contexts/ThreeContext";
import { YaytsoMetaWeb2 } from "../../contexts/types";

// This is the meta data for some reason should be id and fetch from the blockchain
export default function Egg({ meta }: { meta: YaytsoMetaWeb2 }) {
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  const { initScene } = useThreeScene();
  // const { metadata, entities } = useFetchedYaytso(eggId);
  const { loaded: metadata, entities } = useGltfCid(meta.gltfCID);
  useEffect(() => {
    console.log(sceneContainer.current);
    if (!sceneContainer.current) {
      return;
    }
    // console.log(metadata);
    // if (!metadata) {
    //   return;
    // }
    console.log("initing scene");
    const cleanup = initScene(sceneContainer.current, true);

    return () => cleanup();
  }, []);

  // if (!metadata) {
  //   return <DotTyping />;
  // }

  return (
    <div className="egg-view__container">
      <div
        className="egg-view__name"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        {meta.name}
      </div>
      {/* <button className="info-button" onClick={openEggInfo}>
        i
      </button> */}
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
      <div className="egg-view__description">{meta && meta.description}</div>
    </div>
  );
}
