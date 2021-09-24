import ReactDOM from "react-dom";
import "./index.css";
import "./styles/buttons.css";
import "./styles/transitions.css";
import "./styles/modal.css";
import "./styles/overlay.css";
import "./styles/nav.css";
import "./styles/wallet.css";

import App from "./App";
import { MapProvider } from "./contexts/MapContext";
import { ModalProvider } from "./contexts/ModalContext";
import { CartonProvider } from "./contexts/CartonContext";
import { UserProvider } from "./contexts/UserContext";
import { ContractProvider } from "./contexts/ContractContext";
import { WalletProvider } from "./contexts/WalletContext";

ReactDOM.render(
  <ModalProvider>
    <CartonProvider>
      <MapProvider>
        <UserProvider>
          <ContractProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </ContractProvider>
        </UserProvider>
      </MapProvider>
    </CartonProvider>
  </ModalProvider>,
  document.getElementById("root")
);
