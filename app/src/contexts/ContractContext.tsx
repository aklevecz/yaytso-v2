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
import { updateYaytso } from "./services";
import { YaytsoMetaWeb2 } from "./types";

const YAYTSO_HARDHAT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const YAYTSO_MAIN_ADDRESS = "0x155b65c62e2bf8214d1e3f60854df761b9aa92b3";
const CARTON_MAIN_ADDRESS = "0x7c05cf1a1608eE23652014FB12Cb614F3325CFB5";

const YAYTSO_RINKEBY_ADDRESS = "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf";
const CARTON_RINKEBY_ADDRESS = "0x8b401BEe910bd2B810715Ca459434A884C266324";

const NETWORK = process.env.NODE_ENV === "development" ? "rinkeby" : "rinkeby";
export const CHAIN_ID = NETWORK === "rinkeby" ? 4 : 1;
const YAYTSO_ADDRESS =
  NETWORK === "rinkeby" ? YAYTSO_RINKEBY_ADDRESS : YAYTSO_MAIN_ADDRESS;

const contractMap: { [key: string]: { interface: any; address: string } } = {
  yaytso: { interface: YaytsoInterface, address: YAYTSO_ADDRESS },
  carton: { interface: CartonInterface, address: CARTON_MAIN_ADDRESS },
};

type Action = {
  type: "initContract";
  contractName: "yaytsoContract" | "cartonContract";
  contract: ethers.Contract;
};

type Dispatch = (action: Action) => void;

type State = {
  yaytsoContract: ethers.Contract | undefined;
  cartonContract: ethers.Contract | undefined;
  provider: ethers.providers.BaseProvider;
};
console.log(NETWORK);
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
};

const ContractContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "initContract":
      return { ...state, [action.contractName]: action.contract };
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

  const initContract = useCallback(
    (contract: string) => {
      const address = contractMap[contract].address;
      const abi = contractMap[contract].interface.abi;
      return new ethers.Contract(address, abi, state.provider);
    },
    [state.provider]
  );

  useEffect(() => {
    const yaytsoContract = initContract("yaytso");
    const cartonContract = initContract("carton");

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
  }, [initContract, state.provider]);

  const value = { state, dispatch };
  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export { ContractContext, ContractProvider };

export const useCartonContract = () => {
  const context = useContext(ContractContext);

  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }

  const { dispatch, state } = context;

  return state.cartonContract;
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
  if (context === undefined) {
    throw new Error("Carton Context error in Cartons hook");
  }

  const { dispatch, state } = context;

  const { yaytsoContract } = state;
  const { address, signer } = wallet;

  const getYaytsoURI = async (yaytsoId: number) => {
    if (!yaytsoContract) {
      return;
    }
    const meta = await yaytsoContract.tokenURI(yaytsoId);
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
        updateYaytso(metaCID, { nft: true });
      } else {
        // setTxState(TxStates.Failed);
      }
    }
    return { success: true };
  };

  const reset = () => setTxState(TxStates.Idle);

  return {
    contract: state.yaytsoContract,
    getYaytsoURI,
    checkYaytsoDupe,
    layYaytso,
    txState,
    reset,
    receipt,
  };
};
