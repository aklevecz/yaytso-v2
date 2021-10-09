import ReactDOM from "react-dom";
import "./index.css";
import "./styles/buttons.css";
import "./styles/transitions.css";
import "./styles/modal.css";
import "./styles/overlay.css";
import "./styles/nav.css";
import "./styles/wallet.css";
import "./styles/map.css";

import App from "./App";
import { ModalProvider } from "./contexts/ModalContext";
import { CartonProvider } from "./contexts/CartonContext";
import { UserProvider } from "./contexts/UserContext";
import { ContractProvider } from "./contexts/ContractContext";
import { WalletProvider } from "./contexts/WalletContext";
import { MapProvider } from "./contexts/MapContext";

ReactDOM.render(
  <CartonProvider>
    <UserProvider>
      <ContractProvider>
        <WalletProvider>
          <MapProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </MapProvider>
        </WalletProvider>
      </ContractProvider>
    </UserProvider>
  </CartonProvider>,
  document.getElementById("root")
);
