import Button from "../../components/Button";
import {
  useMetaMask,
  useWallet,
  useWalletConnect,
} from "../../contexts/WalletContext";
import { useUser } from "../../contexts/UserContext";
import Eggs from "./Eggs";
import LoginButton from "../../components/Button/LoginButton";
import LogoutButton from "../../components/Button/LogoutButton";
import { WalletTypes } from "../../contexts/types";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import Eggvatar from "./Eggvatar";
import { useNetwork } from "../../contexts/ContractContext";
import React from "react";
import DiscordButton, { discordColor } from "./DiscordButton";
import SelectNetwork from "./SelectNetwork";

export default function Wallet() {
  const { wallet, disconnect } = useWallet();
  const user = useUser();
  const { metamaskConnect, isConnected } = useMetaMask();
  const { startProvider } = useWalletConnect();

  const { updateNetwork, network } = useNetwork();

  const { scrollYProgress, scrollY } = useViewportScroll();
  const marginLeft = useTransform(
    scrollY,
    [50, 100],
    [10, window.innerWidth + 200]
  );
  const marginTop = useTransform(scrollY, [50, 350], [10, -230]);

  const onNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNetwork(e.target.value);
  };
  return (
    <div className="wallet__root">
      {user.eggvatar && (
        <div className="eggvatar__container">
          <Eggvatar cid={user.eggvatar.svgCID} />
        </div>
      )}
      <div className="wallet__container">
        <motion.div style={{ marginLeft }} className="wallet__user-info">
          {/* <div className="wallet__user-info"> */}
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
              <SelectNetwork
                onNetworkChange={onNetworkChange}
                network={network}
              />
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
        {/* </div> */}

        <motion.div style={{ marginTop, overflowX: "hidden" }}>
          {user.uid && <Eggs wallet={wallet} />}
          {!user.uid && (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                flexDirection: "column",
                marginTop: "10%",
                fontWeight: "bold",
              }}
            >
              <div
                style={{ marginBottom: 20, fontSize: "1.3rem", width: "80%" }}
              >
                You must login to view your collection!
              </div>
              <LoginButton />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
