import { Position } from "../../contexts/types";
import { Views } from "../Map";
import Bottom from "./Bottom";
import Right from "./Right";

type Props = {
  bottomAction: () => void;
  goToCreateView: () => void;
  view: Views;
  position: Position;
};
export default function Overlay({
  goToCreateView,
  view,
  position,
  bottomAction,
}: Props) {
  return (
    <div className="overlay__root">
      <div className="overlay__container">
        <Right />
        <Bottom
          goToCreateView={goToCreateView}
          view={view}
          action={bottomAction}
          position={position}
        />
      </div>
    </div>
  );
}
