import Button, { Sizes } from ".";
import { useLogin } from "../../contexts/UserContext";

type Props = {
  size?: Sizes;
  width?: number | string;
};

export default function LogoutButton({ size, width }: Props) {
  const { logout } = useLogin();
  return <Button name="Logout" onClick={logout} size={size} width={width} />;
}
