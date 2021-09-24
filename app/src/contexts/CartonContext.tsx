import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { CARTONS, db } from "../firebase";
import { useCartonContract, useYaytsoContract } from "./ContractContext";
import { Carton, YaytsoMeta } from "./types";
import { ipfsToHttps } from "./utils";

type Action = { type: "updateCartons"; cartons: Array<Carton> };

type Dispatch = (action: Action) => void;

type State = {
  cartons: Array<Carton>;
};

const initialState = {
  cartons: [],
  selectedCarton: undefined,
};

const CartonContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "updateCartons":
      return { ...state, cartons: action.cartons };
    default:
      return state;
  }
};

const CartonProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // NOTE: SHOULD BE AREA SPECIFIC OR SOMETHING
    db.collection(CARTONS).onSnapshot((querySnapshot) => {
      const cartons: Array<Carton> = [];
      querySnapshot.forEach((doc) => {
        const { lat, lng, yaytsoId, locked } = doc.data();
        const id = parseInt(doc.id);
        cartons.push({ lat, lng, locked, yaytsoId, id });
      });
      dispatch({ type: "updateCartons", cartons });
    });
  }, []);

  const value = { state, dispatch };
  return (
    <CartonContext.Provider value={value}>{children}</CartonContext.Provider>
  );
};

export { CartonContext, CartonProvider };

export const useCartons = () => {
  const context = useContext(CartonContext);

  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }

  const { dispatch, state } = context;

  return state.cartons;
};

// export const useCartonInfo = () => {
//   const context = useContext(CartonContext);
//   const cartonContract = useCartonContract();
//   const { getYaytsoMeta } = useYaytsoContract();

//   if (context === undefined) {
//     throw new Error("Carton Context error in Cartons hook");
//   }

//   const { dispatch, state } = context;

//   const isLocked = async (id: number) =>
//     cartonContract && (await cartonContract.Boxes(id)).locked;

//   const getCartonsYaytsoMeta = async (cartonId: number) => {
//     const yaytsoId = state.cartons.find(
//       (carton: Carton) => carton.id === cartonId
//     )!.yaytsoId;
//     if (!yaytsoId) {
//       return null;
//     }
//     const meta = await getYaytsoMeta(yaytsoId);
//     const url = meta.replace("ipfs://", "https://") + ".ipfs.dweb.link";
//     return fetch(url).then((r: Response) => r.json());
//   };

//   return { isLocked, getCartonsYaytsoMeta };
// };

// This is more specific to fetching a yaytso from a carton than its own info
export const useCartonInfo = (data: { cartonId: number }) => {
  const context = useContext(CartonContext);
  const [yaytso, setYaytso] = useState<YaytsoMeta>();
  const cartonContract = useCartonContract();
  const { getYaytsoURI } = useYaytsoContract();

  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }

  const { dispatch, state } = context;

  const isLocked = async (id: number) =>
    cartonContract && (await cartonContract.Boxes(id)).locked;

  // SIDE EFFECT: this tries to fetch when you close the carton, which it should not
  const getCartonsYaytsoMeta = async () => {
    setYaytso(undefined);
    if (!data) {
      return console.log("nothing here");
    }
    const yaytsoId = state.cartons.find(
      (carton: Carton) => carton.id === data.cartonId
    )!.yaytsoId;
    if (!yaytsoId) {
      return null;
    }
    const meta = await getYaytsoURI(yaytsoId);
    const url = meta.replace("ipfs://", "https://") + ".ipfs.dweb.link";
    const yaytsoMeta = await fetch(url).then((r: Response) => r.json());
    setYaytso(yaytsoMeta);
  };

  const getYaytsoImage = async () => {
    if (yaytso) {
      const prefix = ipfsToHttps(yaytso.image).split("?")[0];
      return fetch(prefix + ".ipfs.dweb.link").then((r) => r.text());
    }
    return null;
  };

  useEffect(() => {
    getCartonsYaytsoMeta();
  }, [data && data.cartonId]);

  return { isLocked, yaytso, getYaytsoImage };
};
