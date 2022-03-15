import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useStaticGltf, useThreeScene } from "../../contexts/ThreeContext";

import Checking from "./Checking";
import Winner from "./Winner";
import Loser from "./Loser";

import Button from "../../components/Button";
import { validateEmail } from "../../utils";

import monaEgg from "../../assets/mona_egg.glb";
import { BACKEND_HOST } from "../../constants";

import "../../styles/egg-view.css";
import "./styles.css";

const CODE = "code";
const SECRET_KEY = "mona_guestlist";
export const getSecret = () => localStorage.getItem(SECRET_KEY);

export default function Guestlist() {
  const [checking, setChecking] = useState<boolean | undefined>(undefined);
  const [isWinner, setIsWinner] = useState(false);
  const [winner, setWinner] = useState<boolean | null>(null);
  const { search } = useLocation();
  const sceneContainer = useRef<HTMLDivElement | null>(null);
  useStaticGltf(monaEgg, false);
  const { initScene } = useThreeScene();

  useEffect(() => {
    if (!sceneContainer.current) {
      return;
    }
    const cleanup = initScene(sceneContainer.current, true, true);
    return () => cleanup();
  }, [initScene]);

  const [email, setEmail] = useState("");
  const onEmailChange = (e: React.FormEvent<HTMLInputElement>) =>
    setEmail(e.currentTarget.value);

  const check = () => {
    const code = new URLSearchParams(search).get(CODE);
    fetch(
      `${BACKEND_HOST}/guestlist?code=${code}&ss=${getSecret()}&email=${email}`
    )
      .then((r) => r.json())
      .then((data) => {
        setChecking(false);
        if (data.winner) {
          if (data.email) {
            setIsWinner(true);
          }
          localStorage.setItem("mona_guestlist", data.secret);
          setWinner(data.winner);
        } else {
          setWinner(false);
        }
      });
  };

  const claim = () => {
    setChecking(true);
    check();
  };

  useEffect(() => {
    const secret = getSecret();
    if (secret) {
      check();
    }
  }, []);
  const disabled = validateEmail(email);
  return (
    <div>
      {checking && <Checking />}
      <div className="egg-view__container" style={{ margin: "auto" }}>
        <div className="guestlist__egg-name">MONA X VOLTA Winner?</div>
        <div
          className="egg-view__canvas__container"
          ref={sceneContainer}
          style={{
            // paddingTop: 60,
            height: 200,
            width: 200,
            margin: "auto",
          }}
        />
        {checking === undefined && (
          <>
            <div className="guestlist__text">
              Want to go to MONA X VOLTA in LA this weekend? Fill out your email
              and click below to see if you won!
            </div>
            <input
              placeholder="Email"
              onChange={onEmailChange}
              type="text"
              name="email"
              style={{ marginBottom: 20 }}
            />
            <Button
              // background="red"
              size=""
              display="block"
              width={150}
              margin="auto"
              onClick={claim}
              disabled={!disabled}
            >
              Claim ticket!
            </Button>
          </>
        )}

        {winner === true && <Winner search={search} isWinner={isWinner} />}
        {winner === false && <Loser />}
      </div>
    </div>
  );
}
