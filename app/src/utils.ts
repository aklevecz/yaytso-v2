import { IPFS_URL } from "./constants";

export const isMobile = () => window.innerWidth < 768;

export const ipfsLink = (hash: string) => IPFS_URL.replace("__HASH__", hash);
