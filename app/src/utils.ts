import { IPFS_URL } from "./constants";

export const host =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://yaytso.art";

export const claimUrl = (signature: string, boxId: number, nonce: number) =>
  `${host}/claim/${signature}/${boxId}/${nonce}`;

export const isMobile = () => window.innerWidth < 768;

export const ipfsLink = (hash: string) => IPFS_URL.replace("__HASH__", hash);
