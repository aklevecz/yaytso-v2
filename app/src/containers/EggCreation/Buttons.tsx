import { UserInfo } from "os";
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
  onEggvatar: any;
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
  onEggvatar,
  uploadPattern,
  updating,
}: Props) {
  if (updating || viewState === ViewStates.Creating) {
    return <LoadingButton color="white" />;
  }

  const onNameEgg = () => {
    if (user.uid) {
      openModal(ModalTypes.EggMaker);
    } else {
      openModal(ModalTypes.CreateEggNotLoggedIn);
    }
  };

  const onCreate = () => {
    if (user.uid) {
      if (user.hasEggvatar) {
        onExport();
      } else {
        onEggvatar();
      }
    } else {
      openModal(ModalTypes.CreateEggNotLoggedIn);
    }
  };
  // if (!user.uid) {
  //   return (
  //     <Button
  //       name="Login / Signup"
  //       size="flex2"
  //       width="60%"
  //       onClick={() => openModal(ModalTypes.Login)}
  //     />
  //   );
  // }

  if (viewState === ViewStates.Blank) {
    return (
      <label className="upload-label">
        <input ref={inputRef} onChange={uploadPattern} type="file" />
        Upload An Image
      </label>
    );
  }

  if (viewState === ViewStates.Pattern) {
    return (
      <Fragment>
        <Button name="Name the Egg" size="md" onClick={onNameEgg} />
        <FloatingButtonContainer bottom={"20%"} right={"50%"} marginRight={-65}>
          <Button name="Clear" onClick={reset} className="anti-state" />
        </FloatingButtonContainer>
      </Fragment>
    );
  }

  // REFACTOR
  // const createPrompt = user.hasEggvatar ? "Create" : "Create Eggvatar";
  let createPrompt = "Create";
  if (user.uid && !user.hasEggvatar) {
    createPrompt = "Create Eggvatar";
  }
  if (viewState === ViewStates.Customized) {
    return (
      <Fragment>
        <Button
          size={user.hasEggvatar ? "" : "md"}
          name={createPrompt}
          onClick={onCreate}
        />
        <FloatingButtonContainer bottom={"20%"} right={"50%"} marginRight={-65}>
          <Button name="Clear" onClick={reset} className="anti-state" />
        </FloatingButtonContainer>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Button name="yay!" onClick={() => alert("yey")} />
    </Fragment>
  );
}
