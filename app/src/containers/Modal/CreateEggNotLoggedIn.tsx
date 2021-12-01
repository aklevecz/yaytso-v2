import Button from "../../components/Button";
import { useModalToggle, useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes } from "../../contexts/types";

export default function CreateEggNotLoggedIn() {
  const { toggleModal } = useModalToggle();
  const openModal = useOpenModal();
  return (
    <div>
      <div className="modal__title">Whoops</div>
      <div className="modal__block">
        You must be signed in to create your beautiful egg!
      </div>
      <div className="modal__button-container">
        <Button fontSize={"1rem"} name="Nevermind" onClick={toggleModal} />
        <Button
          fontSize={"1rem"}
          name="Go To Login"
          onClick={() => openModal(ModalTypes.Login)}
        />
      </div>
    </div>
  );
}
