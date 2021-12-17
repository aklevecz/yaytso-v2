import LoginButton from "../../components/Button/LoginButton";
import DiscordButton from "./DiscordButton";

export default function LoginCta() {
  return (
    <div className="wallet__container--body-cta">
      <div style={{ marginBottom: 20, fontSize: "1.3rem", width: "80%" }}>
        You must login to view your collection!
      </div>
      <LoginButton size="flex2" />
      <DiscordButton name="Sign in with Discord" size="flex2" />
    </div>
  );
}
