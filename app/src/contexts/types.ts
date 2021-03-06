import { ethers } from "ethers";
import WalletConnect from "@walletconnect/client";

export enum ModalTypes {
  Info = "info",
  CartonContent = "cartonContent",
  EggMaker = "eggMaker",
  Login = "login",
  Mint = "mint",
  ExportReceipt = "exportReceipt",
  EggInfo = "eggInfo",
  ConfirmAction = "confirmAction",
  Welcome = "welcome",
  CreateCarton = "createCarton",
  FillCarton = "fillCarton",
  Receipt = "receipt",
  Claim = "claim",
  ConnectWallet = "connectWallet",
  CreateEggNotLoggedIn = "createEggNotLoggedIn",
}

export type Position = {
  lat: number | undefined;
  lng: number | undefined;
};

export type MarkerType = "cartons" | "users" | "create";

export type Marker = {
  type: string;
  marker: google.maps.Marker;
  id?: string;
  isUser?: boolean;
};

export type Carton = {
  id: number;
  lat: string;
  lng: string;
  locked: boolean;
  yaytsoId: number | undefined;
};

export type Egg = {
  name: string | undefined;
  description: string | undefined;
};

export type YaytsoMeta = {
  id?: number;
  name: string;
  description: string;
  patternHash: string;
  image: string;
  nft: boolean;
  svgCID: string;
};

export type YaytsoMetaWeb2 = {
  description: string;
  gltfCID: string;
  metaCID: string;
  name: string;
  nft: boolean;
  patternHash: string;
  svgCID: string;
  uid: string;
  isEggvatar: boolean;
  legacy?: boolean;
};

export type YaytsoCID = {
  metaCID: string;
  svgCID: string;
  gltfCID: string;
};

export type WalletConnectState = {
  connector: WalletConnect;
  address: string;
  chainId: number;
};

export enum WalletTypes {
  Null,
  WalletConnect,
  MetaMask,
}

export type Eth = {
  walletType: WalletTypes;
  chainId: number;
  provider: ethers.providers.Web3Provider | ethers.providers.BaseProvider;
  signer: ethers.Signer;
  address: string;
};

export type WalletState = {
  eth: Eth | undefined;
  connected: boolean;
  provider:
    | ethers.providers.BaseProvider
    | ethers.providers.Web3Provider
    | undefined;
  signer: ethers.Signer | undefined;
  address: string;
  chainId: number | undefined;
  metaFetched: boolean;
  yaytsoMeta: YaytsoMetaWeb2[];
  yaytsoCIDS: YaytsoCID[];
  yaytsoSVGs: string[];
};
