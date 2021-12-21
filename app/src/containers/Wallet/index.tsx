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
  const { scrollY } = useViewportScroll();
  const marginTop = useTransform(scrollY, [50, 350], [10, -230]);

  const isSignedIn = Boolean(user.uid);
  console.log(userLoading);
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
