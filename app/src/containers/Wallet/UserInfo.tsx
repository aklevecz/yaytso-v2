import { motion, useTransform, useViewportScroll } from "framer-motion";
import Button from "../../components/Button";
import { useNetwork } from "../../contexts/ContractContext";
import { WalletState, WalletTypes } from "../../contexts/types";
import SelectNetwork from "./SelectNetwork";
import DiscordButton, { discordColor } from "./DiscordButton";
import { User } from "../../contexts/UserContext";
import LogoutButton from "../../components/Button/LogoutButton";
import { useMetaMask, useWalletConnect } from "../../contexts/WalletContext";

type Props = {
  wallet: WalletState;
  user: User;
  disconnect: () => void;
};
export default function UserInfo({ wallet, user, disconnect }: Props) {
  const { updateNetwork, network } = useNetwork();
  const { metamaskConnect, isConnected } = useMetaMask();
  const { startProvider } = useWalletConnect();
  const onNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNetwork(e.target.value);
  };
  const { scrollY } = useViewportScroll();
  const marginLeft = useTransform(
    scrollY,
    [50, 100],
    [10, window.innerWidth + 200]
  );
  return (
    <motion.div style={{ marginLeft }} className="wallet__user-info">
      {wallet.connected && (
        <div className="wallet__address">
          <div style={{ minWidth: 150, maxWidth: 150, margin: "auto" }}>
            {wallet.address}
          </div>
          {wallet.eth &&
            wallet.eth.walletType === WalletTypes.WalletConnect && (
              <Button
                size="xs"
                width="100%"
                display="block"
                maxWidth={150}
                margin="10px auto"
                name="Disconnect"
                onClick={disconnect}
              />
            )}
          <SelectNetwork onNetworkChange={onNetworkChange} network={network} />
        </div>
      )}
      {user.phone && (
        <div className="wallet__phone">
          <div>{user.phone}</div>
          <div style={{ color: discordColor }}>{user.discordUsername}</div>
          <div style={{ padding: 10, textAlign: "center" }}>
            {user.uid && <LogoutButton size="xs" />}
            {user.uid && !user.discordId && <DiscordButton />}
          </div>
        </div>
      )}
      {!isConnected && (
        <div
          className="wallet__connect-container"
          style={{ textAlign: "center", margin: 20 }}
        >
          {window.ethereum && (
            <Button
              name="Connect Metamask"
              size="flex2"
              onClick={metamaskConnect}
            />
          )}

          <Button name="Connect WC" size="flex2" onClick={startProvider} />
        </div>
      )}
    </motion.div>
  );
}
