import Button, { Sizes } from ".";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes } from "../../contexts/types";

type Props = {
  size?: Sizes;
};

export default function LoginButton({ size }: Props) {
  const openModal = useOpenModal();
  return (
    <Button
      name="Login"
      onClick={() => openModal(ModalTypes.Login)}
      size={size}
    />
  );
}
