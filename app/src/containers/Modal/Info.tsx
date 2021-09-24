import Button from "../../components/Button";
import { useModalToggle } from "../../contexts/ModalContext";

export default function Info() {
  const { toggleModal } = useModalToggle();
  return (
    <div>
      <div className="modal__title">Info</div>
      <div className="modal__block">Hello this is some info</div>
      <div className="modal__button-container">
        <Button name="Ok" onClick={toggleModal} />
      </div>
    </div>
  );
}
