import { useWallet } from "../../contexts/WalletContext";
import { useLoading, useUser } from "../../contexts/UserContext";
import EggCollection from "./EggCollection";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import Eggvatar from "./Eggvatar";
import UserInfo from "./UserInfo";
import LoginCta from "./LoginCta";

export default function Wallet() {
  const { wallet, disconnect } = useWallet();
  const user = useUser();
  const userLoading = useLoading();
  const { scrollY, scrollYProgress } = useViewportScroll();
  // const marginTop = useTransform(scrollY, [200, 350], [0, -230]);
  const marginTop = useTransform(
    scrollY,
    [
      window.innerHeight - window.innerHeight * 0.5,
      window.innerHeight + window.innerHeight * 0.5,
    ],
    [0, -230]
  );
  const isSignedIn = Boolean(user.uid);
  return (
    <div className="wallet__root">
      <Eggvatar user={user} />
      <div className="wallet__container">
        <UserInfo wallet={wallet} user={user} disconnect={disconnect} />
        <motion.div style={{ marginTop, overflowX: "hidden" }}>
          {isSignedIn ? <EggCollection wallet={wallet} /> : <LoginCta />}
        </motion.div>
      </div>
    </div>
  );
}
