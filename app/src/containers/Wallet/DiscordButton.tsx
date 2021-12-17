import Button, { Sizes } from "../../components/Button";
const redirectUri =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/callback"
    : "https://yaytso.art/callback";
const authLink = `https://discord.com/api/oauth2/authorize?client_id=917496007913246731&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.join%20email%20gdm.join`;
type Props = {
  name?: string;
  size?: Sizes;
};
export const discordColor = "#5865F2";
export default function DiscordButton({
  name = "Discord",
  size = "xs",
}: Props) {
  const onClick = () => (window.location.href = authLink);
  return (
    <Button
      name={name}
      onClick={onClick}
      size={size}
      background={discordColor}
    />
  );
}
