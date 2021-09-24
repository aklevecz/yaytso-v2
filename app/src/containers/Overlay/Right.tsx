import { useEffect } from "react";
import { useMap, useUserLocation } from "../../contexts/MapContext";
import Triangulate from "../../components/icons/Triangulate";

export default function Right() {
  const { getUserLocation, createUserMarker, userLocation, recenter } =
    useUserLocation();
  const { loading, map } = useMap();

  // useEffect(() => {
  //   if (map) {
  //     getUserLocation();
  //   }
  // }, [map]);
  return (
    <div className="overlay__right">
      <div style={{ marginRight: 30 }}>
        <button className="btn--icon" onClick={recenter}>
          <Triangulate />
        </button>
      </div>
    </div>
  );
}
