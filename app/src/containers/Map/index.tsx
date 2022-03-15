import { useEffect, useState } from "react";
import LayoutFullHeight from "../../components/Layout/FullHeight";
import { useCartons } from "../../contexts/CartonContext";
import {
  useCreateCartonMarker,
  useMap,
  useUserLocation,
} from "../../contexts/MapContext";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes } from "../../contexts/types";
import { useUser } from "../../contexts/UserContext";
import { useMetaMask, useWalletConnect } from "../../contexts/WalletContext";
import Overlay from "../Overlay";

export enum Views {
  Hunter,
  Creator,
}

const prompts = {
  [Views.Hunter]: "",
  [Views.Creator]: "Drag the carton to its spot",
};

const Position = ({ lat, lng }: { lat: number; lng: number }) => (
  <div className="lat-lng__container">
    <div>{lat.toFixed(4)}</div>
    <div>{lng.toFixed(4)}</div>
  </div>
);

export default function Map() {
  const user = useUser();
  const [view, setView] = useState<Views>(Views.Hunter);
  const {
    map,
    mapContainer,
    hideMarkers,
    initMap,
    removeMap,
    loading,
    fetchAvailableCartons,
  } = useMap();
  // useUserLocation();
  useWalletConnect();
  useMetaMask();

  const { createCartonMarker, removeCreateMarker, position } =
    useCreateCartonMarker();
  const openModal = useOpenModal();
  const cartons = useCartons();

  useEffect(() => {
    initMap();
    return () => {
      removeMap();
    };
  }, [initMap]);

  useEffect(() => {
    if (map && cartons.length > 0) {
      fetchAvailableCartons(cartons);
    }
  }, [map, cartons]);

  const goToCreate = () => {
    openModal(ModalTypes.CreateCarton, {
      goToCreateView: () => {
        setView(Views.Creator);
        createCartonMarker();
        hideMarkers();
      },
    });
  };

  const reset = () => {
    removeCreateMarker();
    setView(Views.Hunter);
  };

  const goToConfirmCarton = () => {
    openModal(ModalTypes.CreateCarton, {
      givenStep: 1,
      position,
      reset,
    });
  };

  const bottomActions = {
    [Views.Hunter]: goToCreate,
    [Views.Creator]: goToConfirmCarton,
  };

  return (
    <>
      <LayoutFullHeight>
        {/* <div
          style={{ position: "absolute", top: 10, left: "50%", color: "red" }}
        >
          {user.uid}
        </div> */}
        <div
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
          ref={mapContainer}
        ></div>

        <div
          className="prompt__container"
          style={{ display: view !== Views.Hunter ? "block" : "none" }}
        >
          <div>{prompts[view]}</div>
        </div>
        <Overlay
          view={view}
          goToCreateView={() => {
            setView(Views.Creator);
            hideMarkers();
          }}
          position={position}
          bottomAction={bottomActions[view]}
        />
        <>
          {view === Views.Creator && position.lat && position.lng && (
            <Position lat={position.lat} lng={position.lng} />
          )}
        </>
      </LayoutFullHeight>
    </>
  );
}
