import Button from "../../components/Button";
import { useModalToggle } from "../../contexts/ModalContext";

export default function Welcome() {
  const { toggleModal } = useModalToggle();
  return (
    <div>
      <div className="modal__title">Welcome to yaytso!</div>
      <div className="modal__block" style={{ margin: 10 }}>
        First thing's first- It's time for you to create your very own eggvatar
      </div>
      <div className="modal__block" style={{ margin: 10 }}>
        Upload an image and/or start drawing with the pen tool
      </div>
      <div className="modal__button-container">
        <Button name="Ok" onClick={toggleModal} />
      </div>
    </div>
  );
}
