import Button from "../../components/Button";
import { useModalToggle } from "../../contexts/ModalContext";
import {
  useMetaMask,
  useWallet,
  useWalletConnect,
} from "../../contexts/WalletContext";

export default function ConnectWallet() {
  const { toggleModal } = useModalToggle();
  const { wallet } = useWallet();
  const { metamaskConnect, isConnected } = useMetaMask();
  const { startProvider } = useWalletConnect();
  return (
    <div>
      {!wallet.connected && (
        <>
          <div className="modal__title">Connect Wallet</div>
          <div className="modal__block">
            <div>
              You must have a wallet connected in order to claim an NFT
              <div className="wallet__connect-container">
                {window.ethereum && (
                  <Button
                    name="Connect Metamask"
                    size="flex2"
                    onClick={metamaskConnect}
                  />
                )}

                <Button
                  name="Connect WC"
                  size="flex2"
                  onClick={startProvider}
                />
              </div>
            </div>
          </div>
          <div className="modal__button-container">
            <Button name="Naw" onClick={toggleModal} />
          </div>
        </>
      )}
      {wallet.connected && (
        <>
          <div className="modal__title">You are connected!</div>
          <div className="modal__block">Time to get that yaytso.</div>
          <div className="modal__button-container">
            <Button name="Let's go!" onClick={toggleModal} />
          </div>
        </>
      )}
    </div>
  );
}
