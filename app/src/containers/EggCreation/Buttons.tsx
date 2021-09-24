import { Fragment } from "react";
import Button from "../../components/Button";
import FloatingButtonContainer from "../../components/Button/FloatingButtonContainer";
import LoadingButton from "../../components/Button/LoadingButton";
import { ModalTypes } from "../../contexts/types";
import { ViewStates } from "./constants";

type Props = {
  user: any;
  openModal: any;
  viewState: any;
  inputRef: any;
  reset: any;
  onExport: any;
  uploadPattern: any;
  updating: boolean;
};

export default function Buttons({
  user,
  openModal,
  viewState,
  inputRef,
  reset,
  onExport,
  uploadPattern,
  updating,
}: Props) {
  if (updating || viewState === ViewStates.Creating) {
    return <LoadingButton color="white" />;
  }
  if (!user.uid) {
    return <Button name="Login" onClick={() => openModal(ModalTypes.Login)} />;
  }

  if (viewState === ViewStates.Blank) {
    return (
      <label className="upload-label">
        <input ref={inputRef} onChange={uploadPattern} type="file" />
        Upload
      </label>
    );
  }

  if (viewState === ViewStates.Pattern) {
    return (
      <Fragment>
        <Button
          name="Customize Egg"
          size="md"
          onClick={() => openModal(ModalTypes.EggMaker)}
        />
        <FloatingButtonContainer bottom={"20%"} right={"50%"} marginRight={-65}>
          <Button name="Clear" onClick={reset} className="anti-state" />
        </FloatingButtonContainer>
      </Fragment>
    );
  }

  if (viewState === ViewStates.Customized) {
    return <Fragment><Button name="Create" onClick={onExport} />  <FloatingButtonContainer bottom={"20%"} right={"50%"} marginRight={-65}>
      <Button name="Clear" onClick={reset} className="anti-state" />
    </FloatingButtonContainer></Fragment>;
  }

  return (
    <Fragment>
      <Button name="yay!" onClick={() => alert("yey")} />
    </Fragment>
  );
}
