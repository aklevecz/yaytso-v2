import LoginButton from "../../components/Button/LoginButton";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes } from "../../contexts/types";
import { PhoneAuth } from "../Modal/Login";
import DiscordButton from "./DiscordButton";

export default function LoginCta() {
  const openModal = useOpenModal();
  return (
    <div className="wallet__container--body-cta">
      <div style={{ marginBottom: 20, fontSize: "1.3rem", width: "80%" }}>
        Sign in to see your eggs
      </div>
      <LoginButton
        size="flex2"
        onClick={() => {
          openModal(ModalTypes.Login, {
            skipToStep: 1,
          });
        }}
      />
      <DiscordButton name="Sign in with Discord" size="flex2" />
    </div>
  );
}
