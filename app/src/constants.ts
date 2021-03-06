export const BACKEND_HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://yaytso.art";

export const IPFS_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/ipfs/__HASH__"
    : "https://gateway.pinata.cloud/ipfs/__HASH__";

export const NAV_CLASS_NAME = "nav";
