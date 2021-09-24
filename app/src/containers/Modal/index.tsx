import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import {
  useModalOpen,
  useModalToggle,
  useModalType,
} from "../../contexts/ModalContext";
import { ModalTypes } from "../../contexts/types";

import Info from "./Info";
import CartonContent from "./CartonContent";
import EggMaker from "./EggMaker";
import Login from "./Login";
import Mint from "./Mint";
import ChevronLeft from "../../components/icons/ChevronLeft";
import ExportReceipt from "./ExportReceipt";
import EggInfo from "./EggInfo"
import ConfirmAction from "./ConfirmAction";

const modalMap = {
  info: { component: <Info />, maxState: 0 },
  cartonContent: { component: <CartonContent />, maxState: 0 },
  eggMaker: { component: <EggMaker />, maxState: 1 },
  login: { component: <Login />, maxState: 1 },
  mint: {
    component: <Mint />,
    maxState: 1,
  },
  exportReceipt: {
    component: <ExportReceipt />,
    maxState: 0,
  },
  eggInfo: {
    component: <EggInfo />,
    maxState: 0
  },
  confirmAction: {
    component: <ConfirmAction />,
    maxState: 0
  }
};

export default function Modal() {
  const open = useModalOpen();
  const [display, setDisplay] = useState(false);
  const { toggleModal, onModalBack, modalState, setMaxModalState, reset } =
    useModalToggle();
  const modalType = useModalType();
  const lastModal = useRef<ModalTypes | undefined>(undefined);
  const modal = modalType && modalMap[modalType];

  useEffect(() => {
    if (open) {
      setDisplay(true);
      if (lastModal && lastModal.current) {
        if (lastModal.current !== modalType) {
          reset();
        }
      }
    } else {
      lastModal.current = modalType
    }
  }, [open]);

  useEffect(() => {
    if (!modal) {
      return;
    }
    setMaxModalState(modal.maxState);
  }, [modalType, setMaxModalState, modal]);

  return createPortal(
    <div className={`modal__container ${display ? "open" : ""}`}>
      <CSSTransition
        in={open}
        timeout={200}
        classNames="fade-in"
        onExited={() => setDisplay(false)}
      >
        <div className="modal__wrapper">
          {modalState > 0 && (
            <div onClick={onModalBack} className="modal__back">
              <ChevronLeft />
            </div>
          )}
          {/* <button onClick={toggleModal} className="modal__close">
            <CloseIcon />
          </button> */}
          <div className="modal__content">{modal && modal.component}</div>
        </div>
      </CSSTransition>
      <div onClick={toggleModal} className="modal__bg"></div>
    </div>,
    document.getElementById("modal-root") as Element
  );
}
