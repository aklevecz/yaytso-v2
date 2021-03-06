import { ethers } from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  Eth,
  WalletState,
  WalletTypes,
  YaytsoCID,
  YaytsoMetaWeb2,
} from "./types";
import { useUser } from "./UserContext";
import { Web3WindowApi } from "./Web3WindowApi";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { fetchUserYaytsos, updateUserAddresses } from "./services";
import { ipfsLink } from "../utils";

declare global {
  interface Window {
    ethereum: any;
  }
}

type Action =
  | {
      type: "INIT_WALLET";
      provider: ethers.providers.Web3Provider | ethers.providers.BaseProvider;
      signer: ethers.Signer;
      address: string;
      chainId: number;
      walletType: WalletTypes;
    }
  | { type: "DISCONNECT" }
  // | { type: "createWallet"; wallet: ethers.Wallet }
  | { type: "SET_CIDS"; yaytsoCIDS: YaytsoCID[] }
  | { type: "SET_META"; yaytsoMeta: YaytsoMetaWeb2[] }
  | { type: "SET_EGGVATAR"; eggvatar: YaytsoMetaWeb2 }
  | { type: "SET_SVGs"; yaytsoSVGs: string[] };

type Dispatch = (action: Action) => void;

type State = WalletState;

// const wallet = {
//   type: WalletTypes.Null,
//   provider: undefined,
//   signer: undefined,
//   address: "",
//   chainId: undefined,
// };
const initialState = {
  eth: undefined,
  connected: false,
  provider: undefined,
  signer: undefined,
  address: "",
  chainId: undefined,
  metaFetched: false,
  yaytsoMeta: [],
  yaytsoCIDS: [],
  yaytsoSVGs: [],
};

const WalletContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      initWallet({ provider, signer, address, chainId, walletType }: Eth): void;
      disconnect(): void;
      updateYaytsos: (limit?: number, startAt?: number) => void;
    }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "INIT_WALLET":
      return {
        ...state,
        address: action.address,
        signer: action.signer,
        provider: action.provider,
        chainId: action.chainId,
        walletType: action.walletType,
        eth: {
          address: action.address,
          signer: action.signer,
          provider: action.provider,
          chainId: action.chainId,
          walletType: action.walletType,
        },
        connected: true,
      };
    case "SET_CIDS":
      return { ...state, yaytsoCIDS: action.yaytsoCIDS };
    case "SET_META":
      return { ...state, yaytsoMeta: action.yaytsoMeta, metaFetched: true };
    case "SET_EGGVATAR":
      return { ...state, eggvatar: action.eggvatar };
    case "SET_SVGs":
      return { ...state, yaytsoSVGs: action.yaytsoSVGs };
    case "DISCONNECT":
      return {
        ...state,
        eth: undefined,
        connected: false,
        provider: undefined,
        signer: undefined,
        address: "",
        chainId: undefined,
      };
    default:
      return state;
  }
};

const WalletProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const user = useUser();

  const initWallet = ({
    signer,
    address,
    chainId,
    provider,
    walletType,
  }: Eth) => {
    if (user.uid && (!user.addresses || !user.addresses.includes(address))) {
      updateUserAddresses(user.uid, address);
    }
    dispatch({
      type: "INIT_WALLET",
      signer,
      address,
      chainId,
      provider,
      walletType,
    });
  };

  const disconnect = () => {
    dispatch({ type: "DISCONNECT" });
  };

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) {
      const web3Wallet = new ethers.Wallet(wallet);
      // dispatch({ type: "createWallet", wallet: web3Wallet });
    }
  }, []);

  // At some point the db query might need a dynamic limit, but no one has enough eggs yet
  const updateYaytsos = (limit = 100, startAt = 0) =>
    fetchUserYaytsos(user.uid, limit, startAt).then((snapshot) => {
      let yaytsoCIDS: YaytsoCID[] = [];
      let yaytsoMeta: YaytsoMetaWeb2[] = [];
      let eggvatar: YaytsoMetaWeb2;
      snapshot.forEach((data) => {
        const {
          metaCID,
          svgCID,
          gltfCID,
          name,
          description,
          patternHash,
          nft,
          isEggvatar,
          legacy,
        } = data.data();
        if (isEggvatar) {
          dispatch({
            type: "SET_EGGVATAR",
            eggvatar: {
              uid: user.uid,
              metaCID,
              svgCID,
              gltfCID,
              name,
              description,
              patternHash,
              nft,
              isEggvatar,
            },
          });
        }
        yaytsoCIDS.push({ metaCID, svgCID, gltfCID });
        yaytsoMeta.push({
          name,
          description,
          patternHash,
          nft,
          svgCID,
          gltfCID,
          metaCID,
          uid: user.uid,
          isEggvatar,
          legacy,
        });
      });
      dispatch({ type: "SET_META", yaytsoMeta });
      dispatch({ type: "SET_CIDS", yaytsoCIDS });
    });

  // useEffect(() => {
  //   if (user) {
  //     updateYaytsos();
  //   }
  // }, [user]);
  const value = { state, dispatch, initWallet, disconnect, updateYaytsos };
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export { WalletContext, WalletProvider };

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("Wallet Context error in Wallet hook");
  }

  const { disconnect, state } = context;
  return { wallet: state, disconnect };
};

export const useCreateWallet = () => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("Wallet Context error in CreateWallet hook");
  }

  const { dispatch, state } = context;
  return state;
};

export const useYaytsoSVGs = () => {
  const [startAt, setStartAt] = useState(0);
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("Wallet Context error in YaytsoSVGs hook");
  }

  const { dispatch, state, updateYaytsos } = context;

  const { yaytsoMeta, metaFetched } = state;

  useEffect(() => {
    updateYaytsos(100, startAt);
  }, []);

  return {
    svgs: state.yaytsoSVGs,
    yaytsoMeta,
    metaFetched,
  };
};

export const useMetaMask = () => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("Wallet Context error in MetaMask hook");
  }
  const { dispatch, state, initWallet, disconnect } = context;
  const web3WindowConnect = (): Promise<Web3WindowApi> => {
    return new Promise(async (resolve, _) => {
      const web3 = new Web3WindowApi();
      const { address, chainId } = await web3
        .requestAccount()
        .catch(console.log);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      initWallet({
        signer,
        address,
        chainId,
        provider,
        walletType: WalletTypes.MetaMask,
      });
      resolve(web3);
    });
  };

  const metamaskConnect = () => {
    if (window.ethereum) {
      web3WindowConnect()
        .then((web3) => {
          if (web3.isAvailable) {
            web3.onNetworkChange(web3WindowConnect);
            web3.onAccountChange(web3WindowConnect, disconnect);
          }
        })
        .catch(console.log);
    } else {
      alert("I don't see a MetaMask extension present");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          web3WindowConnect()
            .then((web3) => {
              if (web3.isAvailable) {
                web3.onNetworkChange(web3WindowConnect);
                web3.onAccountChange(web3WindowConnect, disconnect);
              }
            })
            .catch(console.log);
        }
      });
    }
  }, []);

  return { metamaskConnect, isConnected: state.connected };
};

export const useWalletConnect = () => {
  const context = useContext(WalletContext);
  const [walletConnectProvider, setWalletConnectProvider] =
    useState<WalletConnectProvider | null>(null);
  if (context === undefined) {
    throw new Error("Wallet Context error in WalletConnect hook");
  }

  const { dispatch, state, initWallet } = context;

  const startProvider = useCallback(async () => {
    console.log("STARTING PROVIDER");
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: process.env.REACT_APP_INFURA_KEY,
      // chainId: CHAIN_ID,
    });
    setWalletConnectProvider(walletConnectProvider);
    await walletConnectProvider.enable().catch(console.log);
    const provider = new ethers.providers.Web3Provider(walletConnectProvider);
    const address = (await provider.listAccounts())[0];
    const chainId = (await provider.getNetwork()).chainId;
    (window as any).provider = walletConnectProvider;
    const signer = provider.getSigner();
    initWallet({
      provider,
      address,
      chainId,
      signer,
      walletType: WalletTypes.WalletConnect,
    });
    walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    walletConnectProvider.on("chainChanged", (chainId: number) => {
      console.log("chain changed", chainId);
    });

    // Subscribe to session disconnection
    walletConnectProvider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);
    });
  }, [walletConnectProvider]);

  useEffect(() => {
    const hasWallet = localStorage.getItem("walletconnect");
    if (hasWallet && JSON.parse(hasWallet).connected) {
      startProvider();
    }
  }, []);

  useEffect(() => {
    if (
      walletConnectProvider &&
      !state.connected &&
      walletConnectProvider.connected
    ) {
      walletConnectProvider.disconnect();
    }
  }, [state.connected]);

  return { startProvider };
};

export const useUpdateYaytsos = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("Wallet Context error in YaytsoSVGs hook");
  }
  const { updateYaytsos } = context;
  return { updateYaytsos };
};
