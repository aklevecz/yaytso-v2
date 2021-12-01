import { useUpdateEgg } from "../../contexts/UserContext";
import SlideModal from "./SlideModal";

type ModalProps = {
  param: string;
  cta: string;
  value: string;
  description: string;
};

const eggMakerMap: { [key: number]: ModalProps } = {
  0: {
    param: "name",
    cta: "Name your egg",
    value: "",
    description: "Give this beautiful egg a fitting name!",
  },
  // 1: { param: "description", cta: "Describe your egg", value: "", description: "There must be more than just a name... What else should we know about this wondrous creation?" },
  // 2: { param: "recipient", cta: "Who are you sending it to?", value: "" },
};

export default function EggMaker() {
  const { updateEgg, egg } = useUpdateEgg();
  console.log(egg);
  const done = () => {};
  return (
    <SlideModal propMap={eggMakerMap} updateCallback={updateEgg} values={egg} />
  );
}
