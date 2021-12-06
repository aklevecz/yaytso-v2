import Button from "../../components/Button";
const authLink =
  "https://discord.com/api/oauth2/authorize?client_id=917496007913246731&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify%20guilds.join%20email%20gdm.join";
type Props = {
  // onClick: () => void;
};

export default function DiscordButton({}: Props) {
  const onClick = () => (window.location.href = authLink);
  return (
    <Button margin="10px 0px 0px" name="Discord" onClick={onClick} size="xs" />
  );
}
