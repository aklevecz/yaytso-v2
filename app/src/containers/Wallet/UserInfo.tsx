import { motion, useTransform, useViewportScroll } from "framer-motion";
import Button from "../../components/Button";
import { useNetwork } from "../../contexts/ContractContext";
import { ModalTypes, WalletState, WalletTypes } from "../../contexts/types";
import SelectNetwork from "./SelectNetwork";
import DiscordButton, { discordColor } from "./DiscordButton";
import { User } from "../../contexts/UserContext";
import LogoutButton from "../../components/Button/LogoutButton";
import { useMetaMask, useWalletConnect } from "../../contexts/WalletContext";
import React from "react";
import Discord from "../../components/icons/Discord";
import DisabledWrapper from "../../components/icons/DisabledWrapper";
import Number from "../../components/icons/Number";
import LoginButton from "../../components/Button/LoginButton";
import { useOpenModal } from "../../contexts/ModalContext";
import { PhoneAuth } from "../Modal/Login";

type Props = {
  wallet: WalletState;
  user: User;
  disconnect: () => void;
};

export default function UserInfo({ wallet, user, disconnect }: Props) {
  const { updateNetwork, network } = useNetwork();
  const { metamaskConnect, isConnected } = useMetaMask();
  const { startProvider } = useWalletConnect();
  const openModal = useOpenModal();
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
    <div>
      <motion.div style={{ marginLeft }} className="wallet__user-info">
        <Web3User
          wallet={wallet}
          disconnect={disconnect}
          onNetworkChange={onNetworkChange}
          network={network}
          metamaskConnect={metamaskConnect}
          startProvider={startProvider}
          isConnected={isConnected}
        />
        <Web2User user={user} />
      </motion.div>
      {user.uid && !user.discord && (
        <DiscordButton name="Connect your Discord" size="flex2" />
      )}
      {user.uid && !user.phone && (
        <LoginButton
          size="flex2"
          text="Connect your Phone #"
          onClick={() => {
            openModal(ModalTypes.Login, {
              skipToStep: 1,
              phoneAuth: PhoneAuth.Link,
            });
          }}
        />
      )}
    </div>
  );
}

const Web2User = ({ user }: { user: User }) => {
  const isDiscord = user.discord;
  const isUser = user.uid;

  let username: string | JSX.Element = "";
  if (user.phone) {
    username = user.phone;
    // } else if (isDiscord) {
    //   username = "";
  } else {
    username = (
      <DisabledWrapper>
        <Number />
      </DisabledWrapper>
    );
  }

  let discordName = isDiscord ? (
    user.discordUsername
  ) : (
    <DisabledWrapper>
      <Discord />
    </DisabledWrapper>
  );

  return (
    <div className="wallet__phone">
      <div>{username}</div>
      <div style={{ color: discordColor }}>{discordName}</div>
      {isUser && (
        <div style={{ padding: 10, textAlign: "center" }}>
          <LogoutButton size="xs" />
        </div>
      )}
    </div>
  );
};

const Web3User = ({
  wallet,
  disconnect,
  onNetworkChange,
  network,
  metamaskConnect,
  startProvider,
  isConnected,
}: AddressProps & Web3ConnectProps & { isConnected: boolean }) => {
  if (isConnected) {
    return (
      <Address
        wallet={wallet}
        disconnect={disconnect}
        onNetworkChange={onNetworkChange}
        network={network}
      />
    );
  }

  return (
    <Web3Connect
      metamaskConnect={metamaskConnect}
      startProvider={startProvider}
    />
  );
};

interface AddressProps {
  wallet: WalletState;
  disconnect: () => void;
  onNetworkChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  network: string;
}
const Address = ({
  wallet,
  disconnect,
  onNetworkChange,
  network,
}: AddressProps) => (
  <div className="wallet__address">
    <div className="wallet__address__wrapper">{wallet.address}</div>
    {wallet.eth && wallet.eth.walletType === WalletTypes.WalletConnect && (
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
);

interface Web3ConnectProps {
  metamaskConnect: () => void;
  startProvider: () => void;
}
const Web3Connect = ({ metamaskConnect, startProvider }: Web3ConnectProps) => (
  <div
    className="wallet__connect-container"
    style={{ textAlign: "center", margin: 20 }}
  >
    {window.ethereum && (
      <Button name="Connect Metamask" size="flex2" onClick={metamaskConnect} />
    )}

    <Button name="Connect Wallet" size="flex2" onClick={startProvider} />
  </div>
);
