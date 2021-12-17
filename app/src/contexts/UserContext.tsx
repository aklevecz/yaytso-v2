import { createContext, useContext, useEffect, useReducer } from "react";
import firebase from "firebase";
import { auth, db, onSignIn, YAYTSOS } from "../firebase";
import { Egg, YaytsoMetaWeb2 } from "./types";
import { subscribeToUser } from "./services";

type EggParams = {
  name?: string;
  description?: string;
  recipient?: string;
};

type Action =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "UPDATE_EGG"; params: EggParams }
  | { type: "UPDATE_USER"; user: any }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" };

type Dispatch = (action: Action) => void;

export type User = {
  phone: string;
  uid: string;
  refreshToken: string;
  hasEggvatar: boolean;
  eggvatar?: YaytsoMetaWeb2;
  discordId?: string;
  discord?: boolean;
  discordUsername?: string;
  email?: string;
  addresses: string[];
};

type State = {
  egg: Egg;
  user: User;
  loading: boolean;
};

const initialState = {
  egg: { name: "", description: "", recipient: "" },
  user: {
    phone: "",
    uid: "",
    refreshToken: "",
    hasEggvatar: false,
    eggvatar: null,
  },
  loading: true,
};

const UserContext = createContext<
  | { state: State; dispatch: Dispatch; login: (user: firebase.User) => void }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "UPDATE_EGG":
      return { ...state, egg: { ...state.egg, ...action.params } };
    case "LOGIN":
      return { ...state, user: action.user };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.user } };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
};

const UserProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (user: firebase.User) => {
    const { phoneNumber, uid, refreshToken } = user;
    console.log(user);
    // if (!phoneNumber) {
    //   return console.error("phone number is missing");
    // }
    const { hasEggvatar } = (await onSignIn()).data;
    dispatch({
      type: "UPDATE_USER",
      user: { phone: phoneNumber, uid, refreshToken, hasEggvatar },
    });
  };

  const checkAuth = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("not authed");
      } else {
        if (!state.user.uid) {
          await login(user);
          subscribeToUser(user.uid, dispatch);
        }
      }
      dispatch({ type: "SET_LOADING", loading: false });
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = { state, dispatch, login };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };

export const useUpdateEgg = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User Context error in UpdateEgg hook");
  }

  const { dispatch, state } = context;

  const updateEgg = (params: EggParams) =>
    dispatch({ type: "UPDATE_EGG", params });

  return { updateEgg, egg: state.egg };
};

export const useCustomEgg = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User Context error in CustomEgg hook");
  }

  const clearEgg = () =>
    dispatch({ type: "UPDATE_EGG", params: { name: "", description: "" } });

  const { dispatch, state } = context;
  return { customEgg: state.egg, clearEgg };
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User Context error in User hook");
  }

  const { state } = context;
  return state.user;
};

export const useLogin = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User Context error in useLogin hook");
  }

  const { login, dispatch } = context;

  const logout = () => {
    auth.signOut();
    dispatch({ type: "LOGOUT" });
  };
  return { login, logout };
};

export const useLoading = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User Context error in useLogin hook");
  }

  const { state, dispatch } = context;

  return state.loading;
};
