import { createContext, useContext, useEffect, useReducer } from "react";
import firebase from "firebase";
import { auth, db, YAYTSOS } from "../firebase";
import { Egg } from "./types";

type EggParams = {
  name?: string;
  description?: string;
  recipient?: string;
};

type Action =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "UPDATE_EGG"; params: EggParams }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" };

type Dispatch = (action: Action) => void;

type User = {
  phone: string;
  uid: string;
  refreshToken: string;
};

type State = {
  egg: Egg;
  user: User;
  loading: boolean;
};

const initialState = {
  egg: { name: "", description: "", recipient: "" },
  user: { phone: "", uid: "", refreshToken: "" },
  loading: true,
};

const UserContext = createContext<
  | { state: State; dispatch: Dispatch; login: (user: firebase.User) => void }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading }
    case "UPDATE_EGG":
      return { ...state, egg: { ...state.egg, ...action.params } };
    case "LOGIN":
      return { ...state, user: action.user };
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

  const login = (user: firebase.User) => {
    const { phoneNumber, uid, refreshToken } = user;
    if (!phoneNumber) {
      return console.error("phone number is missing");
    }
    dispatch({
      type: "LOGIN",
      user: { phone: phoneNumber, uid, refreshToken },
    });
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("not authed")
      } else {

        login(user);
      }
      dispatch({ type: "SET_LOADING", loading: false })
    });
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
  console.log(state.egg)
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

  return state.loading
}