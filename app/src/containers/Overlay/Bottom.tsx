import Button from "../../components/Button";
import { useOpenModal } from "../../contexts/ModalContext";
import { ModalTypes, Position } from "../../contexts/types";
import { Views } from "../Map";

type Props = {
  action: () => void;
  goToCreateView: () => void;
  view: Views;
  position: Position;
};
export default function Bottom({
  goToCreateView,
  view,
  action,
  position,
}: Props) {
  return (
    <div className="overlay__bottom--m">
      <Button
        size="md"
        disabled={view === 1 && !position.lat && !position.lng}
        onClick={() => {
          action();
          // if (view === Views.Hunter) {
          //   openModal(ModalTypes.CreateCarton, { goToCreateView });
          // }

          // if (view === Views.Creator) {
          //   openModal(ModalTypes.CreateCarton, { givenStep: 1 });
          // }
        }}
        name="Create Carton"
      />
    </div>
  );
}
