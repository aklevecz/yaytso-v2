import { useEffect } from "react";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import { useMap } from "../../contexts/MapContext";
import Overlay from "../Overlay";

export default function Map() {
  const { mapContainer, initMap, loading } = useMap();

  useEffect(() => {
    initMap();
  }, [initMap]);

  return (
    <>
      <LayoutFullHeight>
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }} ref={mapContainer}></div>
        <Overlay /></LayoutFullHeight>
    </>
  );
}
