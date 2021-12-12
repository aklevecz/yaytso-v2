import { useWallet } from "../../contexts/WalletContext";
import { useUser } from "../../contexts/UserContext";
import Eggs from "./Eggs";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import Eggvatar from "./Eggvatar";
import UserInfo from "./UserInfo";
import LoginCta from "./LoginCta";

export default function Wallet() {
  const { wallet, disconnect } = useWallet();
  const user = useUser();
  const { scrollY } = useViewportScroll();
  const marginTop = useTransform(scrollY, [50, 350], [10, -230]);

  return (
    <div className="wallet__root">
      {user.eggvatar && (
        <div className="eggvatar__container">
          <Eggvatar cid={user.eggvatar.svgCID} />
        </div>
      )}
      <div className="wallet__container">
        <UserInfo wallet={wallet} user={user} disconnect={disconnect} />
        <motion.div style={{ marginTop, overflowX: "hidden" }}>
          {user.uid && <Eggs wallet={wallet} />}
          {!user.uid && <LoginCta />}
        </motion.div>
      </div>
    </div>
  );
}
