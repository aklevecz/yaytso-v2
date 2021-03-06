import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { ethers } from "ethers";
import YaytsoInterface from "../ethereum/contracts/Yaytso.sol/Yaytso.json";
import CartonInterface from "../ethereum/contracts/Carton.sol/Carton.json";
import { useWallet } from "./WalletContext";
import { addCarton, saveNFT, txLog, updateYaytso } from "./services";
import { YaytsoMetaWeb2 } from "./types";
import { cartongRetrieveClaim, Collections, db } from "../firebase";
import { TxStatus } from "../containers/Modal/CreateCarton";
import { idToNetwork } from "./utils";
import { useUser } from "./UserContext";

const YAYTSO_HARDHAT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const YAYTSO_MAIN_ADDRESS = "0x155b65c62e2bf8214d1e3f60854df761b9aa92b3";
const CARTON_MAIN_ADDRESS = "0x7c05cf1a1608eE23652014FB12Cb614F3325CFB5";

const YAYTSO_RINKEBY_ADDRESS = "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf";
const CARTON_RINKEBY_ADDRESS = "0x2004Ec13Fe8BF6d19Ace9FC687D98Ad1a210386c";

const YAYTSO_POLYGON_ADDRESS = "0x37847a40B038094046B1C767ddf9A536C924A55f";
const CARTON_POLYGON_ADDRESS = YAYTSO_POLYGON_ADDRESS;

const NETWORK = process.env.NODE_ENV === "development" ? "rinkeby" : "mainnet";
export const CHAIN_ID = NETWORK === "rinkeby" ? 4 : 1;
export let YAYTSO_ADDRESS =
  NETWORK === "rinkeby" ? YAYTSO_RINKEBY_ADDRESS : YAYTSO_MAIN_ADDRESS;
export let CARTON_ADDRESS =
  NETWORK === "rinkeby" ? CARTON_RINKEBY_ADDRESS : CARTON_MAIN_ADDRESS;

const contractMap: { [key: string]: { interface: any; address: string } } = {
  yaytso: { interface: YaytsoInterface, address: YAYTSO_ADDRESS },
  carton: { interface: CartonInterface, address: CARTON_ADDRESS },
};

const contractNetworkMap: {
  [key: string]: { [key: string]: { interface: any; address: string } };
} = {
  yaytso: {
    rinkeby: { interface: YaytsoInterface, address: YAYTSO_RINKEBY_ADDRESS },
    mainnet: { interface: YaytsoInterface, address: YAYTSO_MAIN_ADDRESS },
    polygon: { interface: YaytsoInterface, address: YAYTSO_POLYGON_ADDRESS },
  },
  carton: {
    rinkeby: { interface: CartonInterface, address: CARTON_RINKEBY_ADDRESS },
    mainnet: { interface: CartonInterface, address: CARTON_MAIN_ADDRESS },
    polygon: { interface: CartonInterface, address: CARTON_POLYGON_ADDRESS },
  },
};

console.log(CARTON_ADDRESS);

type Action =
  | {
      type: "initContract";
      contractName: "yaytsoContract" | "cartonContract";
      contract: ethers.Contract;
    }
  | { type: "updateNetwork"; network: string };

type Dispatch = (action: Action) => void;

type State = {
  yaytsoContract: ethers.Contract | undefined;
  cartonContract: ethers.Contract | undefined;
  provider: ethers.providers.BaseProvider;
  network: string;
};

const provider =
  // process.env.NODE_ENV === "development"
  false
    ? new ethers.providers.JsonRpcProvider()
    : ethers.providers.getDefaultProvider(NETWORK, {
        infura: process.env.REACT_APP_INFURA_KEY,
        alchemy: process.env.REACT_APP_ALCHEMY_KEY,
        etherscan: process.env.REACT_APP_ETHERSCAN_KEY,
      });

const initialState = {
  yaytsoContract: undefined,
  cartonContract: undefined,
  provider,
  network: NETWORK,
};

const ContractContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "initContract":
      return { ...state, [action.contractName]: action.contract };
    case "updateNetwork":
      return { ...state, network: action.network };
    default:
      return state;
  }
};

const ContractProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { wallet } = useWallet();

  const initContract = useCallback(
    (
      contract: string,
      network: string,
      provider: ethers.providers.BaseProvider | ethers.providers.Web3Provider
    ) => {
      const {
        address,
        interface: { abi },
      } = contractNetworkMap[contract][network];
      return new ethers.Contract(address, abi, provider);
    },
    []
  );

  useEffect(() => {
    const network = state.network;
    const provider:
      | ethers.providers.Web3Provider
      | ethers.providers.BaseProvider = state.provider;

    const yaytsoContract = initContract("yaytso", network, provider);
    const cartonContract = initContract("carton", network, provider);

    dispatch({
      type: "initContract",
      contractName: "yaytsoContract",
      contract: yaytsoContract,
    });

    dispatch({
      type: "initContract",
      contractName: "cartonContract",
      contract: cartonContract,
    });

    dispatch({
      type: "updateNetwork",
      network,
    });
  }, [initContract, state.provider, state.network]);

  useEffect(() => {
    // let network = state.network;
    // let provider:
    //   | ethers.providers.Web3Provider
    //   | ethers.providers.BaseProvider = state.provider;
    // if (wallet.chainId && wallet.provider) {
    if (!wallet.chainId || !wallet.provider) {
      return;
    }
    const network = idToNetwork[wallet.chainId];
    const provider = wallet.provider;
    // }
    const yaytsoContract = initContract("yaytso", network, provider);
    const cartonContract = initContract("carton", network, provider);

    dispatch({
      type: "initContract",
      contractName: "yaytsoContract",
      contract: yaytsoContract,
    });

    dispatch({
      type: "initContract",
      contractName: "cartonContract",
      contract: cartonContract,
    });

    dispatch({
      type: "updateNetwork",
      network,
    });
  }, [wallet.chainId]);

  const value = { state, dispatch, initContract };
  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export { ContractContext, ContractProvider };

export const useNetwork = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }
  const { state, dispatch } = context;
  const updateNetwork = (network: string) => {
    dispatch({ type: "updateNetwork", network });
  };

  return { updateNetwork, network: state.network };
};

// UPDATE CONTRACT ON WALLET NETWORK CHANGE
export const useCartonContract = () => {
  const context = useContext(ContractContext);
  const { wallet } = useWallet();

  const [txState, setTxState] = useState(TxStates.Idle);

  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }

  const { dispatch, state } = context;
  const { cartonContract } = state;
  const { signer, address: walletAddress } = wallet;

  const createBox = async (
    lat: number,
    lng: number,
    txStatus: (status: TxStatus) => void
  ) => {
    if (!cartonContract) {
      return console.error("missing carton contract");
    }
    if (!signer) {
      return console.error("missing signer");
    }
    txStatus(TxStatus.Waiting);
    const contractSigner = cartonContract.connect(signer);
    const latBytes = ethers.utils.formatBytes32String(lat.toString());
    const lngBytes = ethers.utils.formatBytes32String(lng.toString());
    const tx = await contractSigner.createBox(latBytes, lngBytes);

    txStatus(TxStatus.Minting);

    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "BoxCreated") {
        // Success
        const id = parseInt(event.args[0]._hex);
        addCarton(id, lat, lng);
        txStatus(TxStatus.Completed);
      }
    }
  };

  const fillBox = async (boxId: number, tokenId: number) => {
    if (!cartonContract) {
      console.error("missing carton contract");
      return { boxId: 0, nonce: 0 };
    }
    if (!signer) {
      console.error("missing signer");
      return { boxId: 0, nonce: 0 };
    }
    setTxState(TxStates.Waiting);
    const cartonSigner = cartonContract.connect(signer);
    console.log(boxId, walletAddress, tokenId);
    const tx = await cartonSigner
      .fillBox(
        boxId,
        walletAddress,
        tokenId
        //   , {
        //   gasPrice: 100000000000,
        //   gasLimit: 850000,
        // }
      )
      .catch(console.log);
    console.log(tx);
    setTxState(TxStates.Minting);
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "BoxFilled") {
        const nonce = parseInt(event.args.nonce);
        db.collection(Collections.Cartons)
          .doc(`${boxId}`)
          .update({ locked: true, yaytsoId: tokenId, nonce });
        setTxState(TxStates.Completed);
        return { boxId, nonce };
      }
    }
    return { boxId: 0, nonce: 0 };
  };

  const claimYaytso = async (
    key1: string,
    boxId: string,
    nonce: string,
    callback: () => void
  ) => {
    if (!cartonContract) {
      console.error("missing carton contract");
      return;
    }
    if (!signer) {
      console.error("missing signer");
      return;
    }
    const key2 = (await cartongRetrieveClaim({ key1 })).data;
    const signature = key1 + key2;
    setTxState(TxStates.Waiting);
    const cartonSigner = cartonContract.connect(signer);
    const tx = await cartonSigner.claimYaytso(boxId, nonce, signature);
    setTxState(TxStates.Minting);
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "YaytsoClaimed") {
        setTxState(TxStates.Completed);
        callback();
      }
    }
  };

  const getBoxData = async (boxId: number) => {
    if (!cartonContract) {
      return console.error("carton contract is missing");
    }
    const box = await cartonContract.Boxes(boxId);
    return box;
  };

  const getTokenOfBox = async (boxId: number) => {
    if (!cartonContract) {
      return console.error("carton contract is missing");
    }
    const tokenId = await cartonContract.boxIdToTokenId(boxId);
    return tokenId;
  };

  const signMessage = async (boxId: number, nonce: number) => {
    if (!signer) {
      console.error("no signer");
      return { signedMessage: "" };
    }
    if (!cartonContract) {
      console.error("no carton contract");
      return { signedMessage: "" };
    }
    setTxState(TxStates.Waiting);
    const hashedMessage = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [boxId, nonce]
    );
    const bytesMessage = ethers.utils.arrayify(hashedMessage);
    // const signedMessage = await wallet!.signMessage(bytesMessage);
    const signedMessage = await signer.signMessage(bytesMessage);
    const verified = await cartonContract.verify(
      walletAddress,
      boxId,
      nonce,
      signedMessage
    );
    console.log(verified);
    console.log(signedMessage);
    // const verified = true;
    if (verified) {
      setTxState(TxStates.Completed);
      return { signedMessage };
    } else {
      return { signedMessage: "" };
    }
  };

  const reset = () => {
    setTxState(TxStates.Idle);
  };

  return {
    createBox,
    claimYaytso,
    fillBox,
    getBoxData,
    getTokenOfBox,
    signMessage,
    txState,
    reset,
    contract: state.cartonContract,
  };
};

export enum TxStates {
  Idle,
  Waiting,
  Minting,
  Completed,
  Failed,
}

export const useYaytsoContract = () => {
  const [txState, setTxState] = useState<TxStates>(TxStates.Idle);
  const [receipt, setReceipt] = useState({});
  const context = useContext(ContractContext);
  const { wallet } = useWallet();
  const user = useUser();
  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }
  const { dispatch, state } = context;

  const { yaytsoContract } = state;
  const { address, signer } = wallet;

  const checkCartonIsApproved = async (yaytsoId: number) => {
    if (!state.yaytsoContract) {
      return console.error("no yaytso contract");
    }
    if (!state.cartonContract) {
      return console.error("no carton contract");
    }
    const approvedAddress = await state.yaytsoContract.getApproved(yaytsoId);
    return approvedAddress;
  };

  const approveYaytsoForCarton = async (yaytsoId: number, callback: any) => {
    if (!state.yaytsoContract) {
      return console.error("no yaytso contract");
    }
    if (!state.cartonContract) {
      return console.error("no carton contract");
    }
    if (!wallet.signer) {
      return console.error("no signer");
    }
    setTxState(TxStates.Waiting);
    const yaytsoSigner = state.yaytsoContract.connect(wallet.signer);
    state.yaytsoContract.getApproved(yaytsoId).then(console.log);
    const tx = await yaytsoSigner.approve(
      state.cartonContract.address,
      yaytsoId
    );
    setTxState(TxStates.Minting);
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "Approval") {
        setTxState(TxStates.Completed);
        callback();
      }
    }
  };

  const getYaytsoURI = async (yaytsoId: number) => {
    if (!yaytsoContract) {
      return;
    }
    console.log(yaytsoContract.address);
    const meta = await yaytsoContract.tokenURI(yaytsoId);
    console.log(meta);
    return meta;
  };

  const checkYaytsoDupe = async (patternHash: string) => {
    if (!yaytsoContract) {
      return;
    }
    // const patternHash = wallet.yaytsoMeta[yaytsoId].patternHash;
    const isDupe = await yaytsoContract
      .checkDupe(patternHash)
      .catch(console.log);
    if (isDupe) {
      console.log("is dupe");
    }
    console.log(isDupe);
  };

  const getOwnersYaytsos = async () => {
    if (!yaytsoContract || !signer) {
      return {
        error: true,
        message: "You need to have an Ethereum wallet connected!",
      };
    }

    const yaytsos = await yaytsoContract.yaytsosOfOwner(wallet.address);
    const yaytsoIds = yaytsos.map((yaytso: any) => parseInt(yaytso));
    console.log(yaytsoIds);
    return { yaytsoIds };
  };

  const isUserOwnerOfYaytso = async (yaytsoId: number) => {
    if (!yaytsoContract) {
      console.error("no yaytso contract");
      return false;
    }

    const owner = await yaytsoContract.ownerOf(yaytsoId);
    if (wallet.address) {
      return owner === ethers.utils.getAddress(wallet.address);
    }
    return false;
  };

  const layYaytso = async (meta: YaytsoMetaWeb2) => {
    if (!yaytsoContract || !signer) {
      return {
        error: true,
        message: "You need to have an Ethereum wallet connected!",
      };
    }
    const { patternHash, metaCID, svgCID } = meta;
    // const patternHash = wallet.yaytsoMeta[index].patternHash;
    // const metaCID = wallet.yaytsoCIDS[index].metaCID;
    const contractSigner = yaytsoContract.connect(signer);

    setTxState(TxStates.Waiting);
    const tx = await contractSigner
      .layYaytso(address, patternHash, metaCID)
      .catch((error: any) => {
        if (error.toString().includes("no dupes")) {
          return {
            error: true,
            message: "Sorry but there can be no duplicate Yaytsos!",
          };
        }
      });

    if (tx.error) {
      setTxState(TxStates.Failed);
      return tx;
    }
    txLog(tx.hash, metaCID, wallet.address, user.uid);
    setTxState(TxStates.Minting);
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "YaytsoLaid") {
        const { transactionHash, blockNumber } = receipt;
        const { data } = event;
        const tokenId = Number(data);
        setReceipt({
          metaCID,
          svgCID,
          transactionHash,
          blockNumber,
          tokenId,
        });
        setTxState(TxStates.Completed);
        await updateYaytso(metaCID, { nft: true });
        meta.legacy = false;
        await saveNFT(tokenId, meta);
      } else {
        // setTxState(TxStates.Failed);
      }
    }
    return { success: true };
  };

  const reset = () => setTxState(TxStates.Idle);

  return {
    contract: state.yaytsoContract,
    checkCartonIsApproved,
    approveYaytsoForCarton,
    getYaytsoURI,
    getOwnersYaytsos,
    checkYaytsoDupe,
    layYaytso,
    isUserOwnerOfYaytso,
    txState,
    reset,
    receipt,
  };
};
