import { useEffect, useRef } from "react";
import { useStaticGltf, useThreeScene } from "../../contexts/ThreeContext";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import peggy from "../../assets/peggyNYE.glb";
import "../../styles/egg-view.css";

export default function Guestlist() {
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  useStaticGltf(peggy, false);
  const { initScene } = useThreeScene();

  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }
    const cleanup = initScene(sceneContainer.current, true);
    return () => cleanup();
  }, [initScene]);

  useEffect(() => {
    fetch("http://localhost:5000/guestlist", {
      method: "POST",
      body: JSON.stringify({ code: "chicken" }),
    })
      .then((r) => r.json())
      .then(console.log);
  }, []);

  return (
    <LayoutFullHeight>
      <div className="egg-view__container">
        <div className="egg-view__name">name</div>
        <div
          className="egg-view__canvas__container"
          ref={sceneContainer}
          style={{ alignItems: "unset", paddingTop: 27 }}
        />
      </div>
    </LayoutFullHeight>
  );
}
