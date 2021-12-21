import { useEffect, useState } from "react";
import { ipfsLink } from "../../utils";
import EggMask from "../../components/Mask/Egg";
import { useLoading, User } from "../../contexts/UserContext";
type Props = {
  user: User;
};

export default function Eggvatar({ user }: Props) {
  // const [loaded, setLoaded] = useState(false);
  return (
    <div className="eggvatar__container">
      {/* {!loaded && (
        <div
          style={{ height: 100, margin: "50px auto" }}
          className="loading-dot__jank-container"
        >
          <div className="dot-typing"></div>
        </div>
      )} */}
      <img
        src={ipfsLink(user.eggvatar ? user.eggvatar.svgCID : "")}
        // onLoad={() => setLoaded(true)}
        style={{ display: user.eggvatar ? "block" : "none" }}
      />
      {!user.eggvatar && (
        <EggMask
          svgId="blank-avatar"
          imgId="blank-avatar-img"
          visible={true}
          width={100}
          height={100}
        />
      )}
    </div>
  );
}
