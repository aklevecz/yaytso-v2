import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Loader } from "@googlemaps/js-api-loader";
import silverMap from "../assets/whiteMap.json";
import cartonSVG from "../assets/carton.svg";
import cartonEmptySVG from "../assets/carton-empty.svg";
import smilerSVG from "../assets/smiler.svg";
import { Carton, Marker, MarkerType, ModalTypes, Position } from "./types";
import { useOpenModal } from "./ModalContext";
import { delay, getMarker } from "./utils";

type Action =
  | { type: "createMarker" }
  | { type: "initMap"; map: google.maps.Map }
  | { type: "updateUserPosition"; userLocation: Position }
  | { type: "updateMarkers"; markerType: MarkerType; markers: Array<Marker> }
  | { type: "deleteMarker"; markerType: MarkerType; id: string }
  | {
      type: "collectIconSelectors";
      iconType: string;
      icons: Array<HTMLElement>;
    };

type Dispatch = (action: Action) => void;

type State = {
  loading: boolean;
  markers: Record<MarkerType, Array<Marker>>;
  icons: Record<string, Array<HTMLElement> | HTMLElement | undefined>;
  map: google.maps.Map | undefined;
  mapContainer: HTMLDivElement | undefined;
  userLocation: Position;
};

const initialState = {
  loading: true,
  markers: { cartons: [], users: [], create: [] },
  icons: { cartons: [], user: undefined },
  map: undefined,
  mapContainer: undefined,
  userLocation: { lat: undefined, lng: undefined },
};

const MapContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "updateMarkers":
      return {
        ...state,
        markers: { ...state.markers, [action.markerType]: action.markers },
      };
    case "deleteMarker":
      // Refactor name and type need to be reconciled
      const newTypeMarkers = state.markers[action.markerType].filter(
        (marker) => marker.type !== action.id
      );
      // return state
      return {
        ...state,
        markers: { ...state.markers, [action.markerType]: newTypeMarkers },
      };
    case "initMap":
      return { ...state, map: action.map, loading: false };
    case "updateUserPosition":
      return { ...state, userLocation: action.userLocation };
    default:
      return state;
  }
};

const loader = new Loader({
  apiKey: process.env.REACT_APP_GMAP_KEY as string,
  version: "weekly",
});

const LA_COORDS = {
  lat: 34.04944448684695,
  lng: -118.24629715232342,
};

const DEFAULT_COORDS = LA_COORDS;

const MapProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = { state, dispatch };
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export { MapContext, MapProvider };

export const useMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const context = useContext(MapContext);
  // const cartons = useCartons();

  if (context === undefined) {
    throw new Error("must be within its provider: User");
  }

  const { dispatch, state } = context;
  const initMap = useCallback(() => {
    loader.load().then(() => {
      if (!mapContainer.current) {
        return console.error("map container missing");
      }
      const map = new google.maps.Map(mapContainer.current, {
        zoom: 13,
        styles: silverMap,
        center: {
          lat: DEFAULT_COORDS.lat,
          lng: DEFAULT_COORDS.lng,
        },
      });
      dispatch({ type: "initMap", map });

      map.addListener("click", (mapsMouseEvent: any) => {
        console.log(mapsMouseEvent.latLng.toJSON());
      });
    });
  }, [dispatch]);

  // MAYBE MOVE THIS
  // const { isLocked, getCartonsYaytsoMeta } = useCartonInfo();
  const openModal = useOpenModal();

  const fetchAvailableCartons = (cartons: Carton[]) => {
    const cartonMarkers = cartons.map((carton: Carton) => {
      const icon = {
        url: !carton.locked
          ? `${cartonEmptySVG}#cartonId=${carton.id}`
          : `${cartonSVG}#cartonId=${carton.id}`,
        scaledSize: new google.maps.Size(35, 35),
      };
      const cartonMarker = new google.maps.Marker({
        position: {
          lat: parseFloat(carton.lat),
          lng: parseFloat(carton.lng),
        },
        icon,
        map: state.map,
        optimized: false,
      });
      cartonMarker.addListener("click", async () => {
        if (carton.locked) {
          openModal(ModalTypes.CartonContent, { cartonId: carton.id });
        } else {
          openModal(ModalTypes.FillCarton, { cartonId: carton.id });
        }
      });
      return { marker: cartonMarker, type: "carton" };
    });
    console.log("updating", cartonMarkers);
    dispatch({
      type: "updateMarkers",
      markerType: "cartons",
      markers: cartonMarkers,
    });
  };

  // Shitty marker collection for cartons
  // useEffect(() => {
  //   if (cartons) {
  //     setTimeout(() => {
  //       const cartonIcons: Array<HTMLImageElement> = [];
  //       cartons.forEach((carton: Carton) => {
  //         const cartonDom = document.querySelector(
  //           `img[src='${cartonSVG}#cartonId=${carton.id}']`
  //         ) as HTMLImageElement;
  //         if (cartonDom) {
  //           cartonIcons.push(cartonDom);
  //         }
  //       });

  //       dispatch({
  //         type: "collectIconSelectors",
  //         iconType: "carton",
  //         icons: cartonIcons,
  //       });
  //     }, 5000);
  //   }
  // }, [cartons]);

  const hideMarkers = () => {
    for (const marker of state.markers.cartons) {
      marker.marker.setMap(null);
    }
  };

  return {
    mapContainer,
    fetchAvailableCartons,
    hideMarkers,
    initMap,
    loading: state.loading,
    map: state.map,
    markers: state.markers,
  };
};

export const useUserLocation = () => {
  const context = useContext(MapContext);

  if (context === undefined) {
    throw new Error("Map Context error in UserLocation hook");
  }
  const { dispatch, state } = context;

  const createUserMarker = async (lat: number, lng: number) => {
    const position = { lat, lng };
    const userMarker = new google.maps.Marker({
      position: position,
      icon: smilerSVG,
      map: state.map,
      optimized: false,
    });

    dispatch({
      type: "updateMarkers",
      markerType: "users",
      markers: [{ marker: userMarker, type: "user" }],
    });

    const markerDom = await getMarker(`img[src='${smilerSVG}']`);
    if (!markerDom) {
      return console.log("marker is gone");
    }
    delay(100, () => {
      markerDom.classList.add("pulse");
      dispatch({
        type: "collectIconSelectors",
        iconType: "user",
        icons: [markerDom],
      });
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch({ type: "updateUserPosition", userLocation: userLoc });
          if (!state.userLocation.lat && state.map) {
            state.map.panTo(userLoc as google.maps.LatLngLiteral);
            createUserMarker(userLoc.lat, userLoc.lng);
          }
        }
      );
    }
  };

  const recenter = () => {
    state.map &&
      state.map.panTo(state.userLocation as google.maps.LatLngLiteral);
  };

  useEffect(() => {
    if (state.map && state.markers.users[0]) {
      state.markers.users[0].marker.setPosition(
        state.userLocation as google.maps.LatLngLiteral
      );
    }
  }, [state.userLocation]);

  return {
    getUserLocation,
    userLocation: state.userLocation,
    createUserMarker,
    recenter,
  };
};

export const useCreateCartonMarker = () => {
  const context = useContext(MapContext);
  const [position, setPosition] = useState({ lat: 0, lng: 0 });

  if (context === undefined) {
    throw new Error("Map Context error in CreateCartonMarker hook");
  }

  const { dispatch, state } = context;

  const createCartonMarker = () => {
    const icon = {
      url: cartonSVG,
      scaledSize: new google.maps.Size(35, 35),
    };
    const marker = new google.maps.Marker({
      position: { lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng },
      icon,
      map: state.map,
      draggable: true,
    });
    dispatch({
      type: "updateMarkers",
      markerType: "create",
      markers: [{ marker, type: "create" }],
    });

    marker.addListener("drag", (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat && lng) setPosition({ lat, lng });
    });
  };

  const removeCreateMarker = () => {
    dispatch({ type: "deleteMarker", markerType: "create", id: "create" });

    // change type to id
    const createMarker = state.markers.create.find(
      (marker) => marker.type === "create"
    );
    createMarker && createMarker.marker.setMap(null);
    // marker.setMap(null);
  };

  return { createCartonMarker, removeCreateMarker, position };
};
