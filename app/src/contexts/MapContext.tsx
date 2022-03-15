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
import smilerSVG from "../assets/userLocationIcon.svg";
import friendSVG from "../assets/smiler.svg";
import { Carton, Marker, MarkerType, ModalTypes, Position } from "./types";
import { useOpenModal } from "./ModalContext";
import { delay, getMarker } from "./utils";
import SpatialHashGrid from "./spatialHashGrid";
import { Collections, db, realtime, userLocationsRef } from "../firebase";
import { useUpdateCartons } from "./CartonContext";
import { useUser } from "./UserContext";

// Should be abstracted for consistency with frontend/backend
const sb = 100;
const scaledArray = (a: any[]) => {
  const a2 = a.map((v) => v * sb);
  const b = a2[1];
  a2[1] = a2[0];
  a2[0] = b;
  return a2;
};

// US Bounds
const US_WEST_LOW = [32.55855446664711, -123.04017406334255];
const US_EAST_HIGH = [47.18915871942106, -68.13861698904304];
// ** US Bounds

const _CLIENT_BOUNDS = [scaledArray(US_WEST_LOW), scaledArray(US_EAST_HIGH)];
const dims = 10;

const CLIENT_WIDTH = Math.abs(_CLIENT_BOUNDS[0][0] - _CLIENT_BOUNDS[1][0]);
const CLIENT_HEIGHT = Math.abs(_CLIENT_BOUNDS[0][1] - _CLIENT_BOUNDS[1][1]);
const aspect = CLIENT_WIDTH / CLIENT_HEIGHT;
export { aspect };

const _CLIENT_DIMENSIONS = [dims * 2, dims];
const grid = new SpatialHashGrid(_CLIENT_BOUNDS, _CLIENT_DIMENSIONS);
// Should be abstracted for consistency with frontend/backend

type FriendData = {
  friendPosition: Position;
  friendId: string;
};

type Action =
  | { type: "createMarker" }
  | { type: "initMap"; map: google.maps.Map }
  | { type: "removeMap" }
  | { type: "updateUserPosition"; userLocation: Position }
  | { type: "updateFriendPosition"; friends: Array<FriendData> }
  | { type: "updateUserGrid"; userGrid: Array<number> }
  | { type: "updateMarkers"; markerType: MarkerType; markers: Array<Marker> }
  | {
      type: "updateUserMarkers";
      markers: Array<{ id: string; position: Position }>;
    }
  | { type: "deleteMarker"; markerType: MarkerType; id: string }
  | { type: "deleteFriendMarker"; id: string }
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
  userLocationLoaded: boolean;
  friendLocations: Record<string, Position>;
  userGrid: Array<number> | undefined;
};

const initialState = {
  loading: true,
  markers: { cartons: [], users: [], create: [] },
  icons: { cartons: [], user: undefined },
  map: undefined,
  mapContainer: undefined,
  userLocation: { lat: undefined, lng: undefined },
  userLocationLoaded: false,
  friendLocations: {},
  userGrid: undefined,
};

const MapContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "updateMarkers":
      const newMarkerIds = action.markers
        .filter((marker) => marker.id)
        .map((marker) => marker.id);

      const unChangedMarkers = state.markers[action.markerType].filter(
        (marker) => {
          if (!marker.id) {
            return marker;
          }
          if (!newMarkerIds.includes(marker.id)) {
            return marker;
          }
        }
      );
      return {
        ...state,
        markers: {
          ...state.markers,
          [action.markerType]: [...action.markers, ...unChangedMarkers],
        },
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
    case "removeMap":
      return { ...state, map: undefined, loading: true };
    case "updateUserPosition":
      return {
        ...state,
        userLocation: action.userLocation,
        userLocationLoaded: true,
      };
    case "deleteFriendMarker":
      const newUserMarkers = state.markers.users.filter(
        (marker) => marker.id !== action.id
      );
      return { ...state, markers: { ...state.markers, users: newUserMarkers } };
    // or update friends?
    case "updateUserMarkers":
      const updatingMarkerIds = action.markers.map((marker) => marker.id);
      const newPositions: { [key: string]: Position } = action.markers.reduce(
        (pv, cv) => {
          return { ...pv, [cv.id]: cv.position };
        },
        {}
      );
      const currentMarkerIds = state.markers.users.map((marker) => marker.id);

      const createMarkers = action.markers.filter(
        (marker) => !currentMarkerIds.includes(marker.id)
      );
      const newMarkers: Array<Marker> = [];
      createMarkers.forEach((marker) => {
        const icon = {
          url: friendSVG,
          scaledSize: new google.maps.Size(25, 25),
        };
        const userMarker = new google.maps.Marker({
          position: marker.position as google.maps.LatLngLiteral,
          icon,
          map: state.map,
          optimized: false,
          clickable: false,
        });
        newMarkers.push({
          marker: userMarker,
          type: "user",
          id: marker.id,
          isUser: false,
        });
      });

      // BAD dirty update of position
      const existingMarkers = state.markers.users.filter((marker) =>
        updatingMarkerIds.includes(marker.id!)
      );
      existingMarkers.forEach((marker) => {
        marker.marker.setMap(state.map!);
        marker.marker.setPosition(
          newPositions[marker.id!] as google.maps.LatLngLiteral
        );
      });

      // BAD dirty delete
      const goneMarkers = state.markers.users
        .filter((marker) => !marker.isUser)
        .filter((marker) => !updatingMarkerIds.includes(marker.id!));
      goneMarkers.forEach((marker) => {
        marker.marker.setMap(null);
      });
      return {
        ...state,
        markers: {
          ...state.markers,
          users: [...state.markers.users, ...newMarkers],
        },
      };
    case "updateFriendPosition":
      const friendLocations = action.friends.reduce((pv, cv) => {
        // BAD STATE MUTATION ** but I am doing this because the create Marker flow takes a marker in the action
        const marker = state.markers.users.find(
          (marker) => marker.id === cv.friendId
        );
        if (marker) {
          marker.marker.setPosition(
            cv.friendPosition as google.maps.LatLngLiteral
          );
        }
        // STATE MUTATION**
        return { ...pv, [cv.friendId]: cv.friendPosition };
      }, {});

      return {
        ...state,
        friendLocations,
        // friendLocations: {
        //   ...state.friendLocations,
        //   [action.friendId]: action.friendPosition,
        // },
      };
    case "updateUserGrid":
      return { ...state, userGrid: action.userGrid };
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

  const removeMap = () => dispatch({ type: "removeMap" });

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
          openModal(ModalTypes.CartonContent, {
            cartonId: carton.id,
            position: { lat: carton.lat, lng: carton.lng },
          });
        } else {
          openModal(ModalTypes.FillCarton, { cartonId: carton.id });
        }
      });
      return { marker: cartonMarker, type: "carton" };
    });
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
    removeMap,
    loading: state.loading,
    map: state.map,
    markers: state.markers,
  };
};

const USER_LOCATION_UPDATE_MS = 5000;
export const useUserLocation = () => {
  const context = useContext(MapContext);
  const updateCartons = useUpdateCartons();
  const user = useUser();
  const gridRef = useRef<any>();

  if (context === undefined) {
    throw new Error("Map Context error in UserLocation hook");
  }
  const { dispatch, state } = context;

  // useEffect(() => {
  //   if (state.loading) return;
  //   const goneFriends = state.markers.users
  //     .filter((marker) => !marker.isUser)
  //     .filter((marker) => !state.friendLocations[marker.id!]);
  //   goneFriends.forEach((friend) => {
  //     friend.marker.setMap(null);
  //     // dispatch({ type: "deleteFriendMarker", id: friend.id! });
  //   });
  // }, [state.friendLocations, state.loading]);

  const removeUser = (e: any) => {
    e.preventDefault();
    e.returnValue = "";
    alert("are you sure you want to leave?");
    userLocationsRef.child(user.uid).remove();
  };

  useEffect(() => {
    window.addEventListener("beforeunload", removeUser);
    return () => {
      window.removeEventListener("beforeunload", removeUser);
      userLocationsRef.child(user.uid).remove();
    };
  }, [user]);

  // This is create or update
  const createUserMarker = async (lat: number, lng: number, id: string) => {
    console.log("create user Marker");
    const position = { lat, lng };
    const isUser = id === user.uid;
    const iconScalar = isUser ? 50 : 25;
    const icon = {
      url: isUser ? smilerSVG : smilerSVG,
      scaledSize: new google.maps.Size(iconScalar, iconScalar),
    };
    const userMarker = new google.maps.Marker({
      position: position,
      icon,
      map: state.map,
      optimized: false,
      clickable: false,
    });
    dispatch({
      type: "updateMarkers",
      markerType: "users",
      markers: [{ marker: userMarker, type: "user", id, isUser }],
    });

    // else UPDATE POSITION OF MARKER
    // To make the user's marker pulse
    if (isUser) {
      const markerDom = await getMarker(`img[src='${smilerSVG}']`);
      if (!markerDom) {
        return console.log("marker is gone");
      }
      delay(100, () => {
        markerDom.classList.add("pulse");
        markerDom.classList.add("user-marker");
        dispatch({
          type: "collectIconSelectors",
          iconType: "user",
          icons: [markerDom],
        });
      });
    }
  };
  useEffect(() => {
    if (state.loading) return;
    userLocationsRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const friends: Array<{ id: string; position: Position }> = [];
      Object.keys(data).forEach((key: any) => {
        const pos = data[key];
        if (key !== user.uid) {
          friends.push({ position: pos, id: key });
        }
      });
      dispatch({
        type: "updateUserMarkers",
        markers: friends,
      });
    });

    return () => {
      userLocationsRef.off("value");
    };
  }, [state.loading]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const scaledPos = scaledArray([userLoc.lat, userLoc.lng]);
          const cell = grid._GetCellIndex(scaledPos);
          dispatch({ type: "updateUserGrid", userGrid: cell });
          dispatch({ type: "updateUserPosition", userLocation: userLoc });

          // REALTIME LOC
          userLocationsRef.child(user.uid).set({
            lat: userLoc.lat,
            lng: userLoc.lng,
          });

          // Move to useEffect?
          // var userLocations = realtime.ref("userLocations/");
          // userLocationsRef.get().then((snapshot) => {
          //   const data = snapshot.val();
          //   Object.keys(data).forEach((key: any) => {
          //     const pos = data[key];
          //     // if marker already exists -- change its position -- so update the markers -- which is nested in createUserMarker -- so thi should be update?
          //     // if (key !== user.uid) createUserMarker(pos.lat, pos.lng, key);
          //   });
          // });
          // REALTIME LOC
          // if (!state.userLocation.lat && state.map) {
          //   state.map.panTo(userLoc as google.maps.LatLngLiteral);
          //   createUserMarker(userLoc.lat, userLoc.lng, user.uid);
          // }
        }
      );
    }
  };

  useEffect(() => {
    // hash this or something
    if (
      state.userGrid &&
      JSON.stringify(state.userGrid) !== JSON.stringify(gridRef.current)
    ) {
      gridRef.current = state.userGrid;
      const cellId = `${state.userGrid[0]}-${state.userGrid[1]}`;
      db.collection(Collections.Grid)
        .doc(cellId)
        .collection(Collections.Cartons)
        .onSnapshot((querySnapshot) => {
          const cartons: Array<Carton> = [];
          querySnapshot.forEach((doc) => {
            const { lat, lng, yaytsoId, locked } = doc.data();
            const r = doc.data().cartonRef;
            const id = parseInt(doc.id);
            cartons.push({ lat, lng, locked, yaytsoId, id });
          });
          updateCartons(cartons);
        });
    }
  }, [state.userGrid]);

  const recenter = () => {
    state.map &&
      state.map.panTo(state.userLocation as google.maps.LatLngLiteral);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!state.loading && user.uid) {
      getUserLocation();
      interval = setInterval(getUserLocation, USER_LOCATION_UPDATE_MS);
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [state.loading, user.uid]);

  useEffect(() => {
    if (state.userLocationLoaded && state.map) {
      const { lat, lng } = state.userLocation;
      createUserMarker(lat!, lng!, user.uid);
      setTimeout(() => {
        console.log("pan");
        state.map!.panTo({
          lat: lat!,
          lng: lng!,
        } as google.maps.LatLngLiteral);
      }, 1000);
    }
  }, [state.userLocationLoaded, state.map]);

  useEffect(() => {
    const { lat, lng } = state.userLocation;
    if (lat && lng) {
      // Look for user marker existence
      const userMarker = state.markers.users.find(
        (marker) => marker.id === user.uid
      );
      // create marker if it doesn't exist -- this could be done at some initilization
      if (!userMarker && state.map) {
        state.map.panTo({ lat, lng } as google.maps.LatLngLiteral);
        // createUserMarker(lat, lng, user.uid);
        // if it exists just move it whenever the location changes
      } else {
        userMarker!.marker.setMap(state.map!);
        userMarker!.marker.setPosition({
          lat,
          lng,
        } as google.maps.LatLngLiteral);
      }
    }
  }, [state.userLocation]);

  return {
    getUserLocation,
    userLocation: state.userLocation,
    createUserMarker,
    recenter,
  };
};

export const useUserPosition = () => {
  const context = useContext(MapContext);

  if (context === undefined) {
    throw new Error("Map Context error in UserPosition hook");
  }

  const {
    state: { userLocation },
  } = context;
  return userLocation;
};

export const useCreateCartonMarker = () => {
  const context = useContext(MapContext);
  const [position, setPosition] = useState({ lat: 0, lng: 0 });

  if (context === undefined) {
    throw new Error("Map Context error in CreateCartonMarker hook");
  }

  const { dispatch, state } = context;

  const createCartonMarker = () => {
    if (!state.map) {
      return console.error("map is missing");
    }
    const icon = {
      url: cartonSVG,
      scaledSize: new google.maps.Size(35, 35),
    };
    const userPosition = {
      lat: state.userLocation.lat,
      lng: state.userLocation.lng,
    };
    const cameraPosition = state.map.getCenter()!.toJSON();
    const hasUserCoords = state.userLocation.lat && state.userLocation.lng;

    const position = hasUserCoords ? cameraPosition : DEFAULT_COORDS;

    if (hasUserCoords) {
      setPosition(position);
    }

    const marker = new google.maps.Marker({
      position,
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
