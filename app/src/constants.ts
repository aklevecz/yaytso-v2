export const IPFS_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/ipfs/__HASH__"
    : "https://__HASH__.ipfs.dweb.link";
export const NAV_CLASS_NAME = "nav";
