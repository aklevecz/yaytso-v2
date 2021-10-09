import { useEffect, useRef, useState } from "react";
import { useStaticGltf, useThreeScene } from "../../contexts/ThreeContext";

import peggy from "../../assets/peggyNYE.glb";
import "../../styles/egg-view.css";
import { BACKEND_HOST } from "../../constants";
import { useLocation } from "react-router-dom";
import Checking from "./Checking";
import Winner from "./Winner";
import Loser from "./Loser";

import "./styles.css";

const CODE = "code";
const SECRET_KEY = "peggy_guestlist";
export const getSecret = () => localStorage.getItem(SECRET_KEY);

export default function Guestlist() {
  const [checking, setChecking] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [winner, setWinner] = useState<boolean | null>(null);
  const { search } = useLocation();
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  useStaticGltf(peggy, false);
  const { initScene } = useThreeScene();

  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }
    const cleanup = initScene(sceneContainer.current, true, true);
    return () => cleanup();
  }, [initScene]);

  useEffect(() => {
    const code = new URLSearchParams(search).get(CODE);
    fetch(`${BACKEND_HOST}/guestlist?code=${code}&ss=${getSecret()}`)
      .then((r) => r.json())
      .then((data) => {
        setChecking(false);
        if (data.winner) {
          if (data.email) {
            setIsWinner(true);
          }
          localStorage.setItem("peggy_guestlist", data.secret);
          setWinner(data.winner);
        } else {
          setWinner(false);
        }
      });
  }, []);

  return (
    <div>
      {checking && <Checking />}
      <div className="egg-view__container" style={{ margin: "auto" }}>
        <div className="guestlist__egg-name">P(egg)y Guestlist?</div>
        <div
          className="egg-view__canvas__container"
          ref={sceneContainer}
          style={{
            // paddingTop: 60,
            height: 200,
            width: 200,
            margin: "auto",
          }}
        />{" "}
        {winner === true && <Winner search={search} isWinner={isWinner} />}
        {winner === false && <Loser />}
      </div>
    </div>
  );
}
