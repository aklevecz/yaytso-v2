import { IPFS_URL } from "./constants";
import { Position } from "./contexts/types";

export const host =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://yaytso.art";

export const claimUrl = (signature: string, boxId: number, nonce: number) =>
  `${host}/claim/${signature}/${boxId}/${nonce}`;

export const isMobile = () => window.innerWidth < 768;

export const ipfsLink = (hash: string) => IPFS_URL.replace("__HASH__", hash);

export function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const asin = Math.asin;
const cos = Math.cos;
const sin = Math.sin;
const sqrt = Math.sqrt;
const PI = Math.PI;

// equatorial mean radius of Earth (in meters)
const R = 6378137;

function squared(x: number) {
  return x * x;
}
function toRad(x: number) {
  return (x * PI) / 180.0;
}
function hav(x: number) {
  return squared(sin(x / 2));
}

// hav(theta) = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLon - aLon)
export function haversineDistance(a: Position, b: Position) {
  const aLat = toRad(Array.isArray(a) ? a[1] : a.lat);
  const bLat = toRad(Array.isArray(b) ? b[1] : b.lat);
  const aLng = toRad(Array.isArray(a) ? a[0] : a.lng);
  const bLng = toRad(Array.isArray(b) ? b[0] : b.lng);

  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng);
  return 2 * R * asin(sqrt(ht));
}
