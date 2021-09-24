import Button from "../../components/Button";
import { useModalToggle, useModalData } from "../../contexts/ModalContext";

export default function ConfirmAction() {
	const { toggleModal } = useModalToggle();
	const { data } = useModalData()
	const { prompt, action } = data;

	const confirm = () => {
		action();
		toggleModal();
	}
	return (
		<div>
			<div className="modal__title">Are you sure?</div>
			<div className="modal__block">{prompt}</div>
			<div className="modal__button-container">
				<Button name="Cancel" onClick={toggleModal} />
				<Button name="Confirm" className="danger" onClick={confirm} />
			</div>
		</div>
	);
}