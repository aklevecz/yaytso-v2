import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { useModalToggle } from "../../contexts/ModalContext";
import { BiAnim } from "./Transitions";

// Make transition state part of the modal context so the upper level components
// have access to the call manipulating the child useEffect

// Or this could be a generate component that takes an update function and viewDataMap
export default function SlideModal({ propMap, updateCallback, values }: any) {
  // const [state, setState] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const { modalState, onModalNext, maxState, toggleModal } = useModalToggle();
  const state = modalState;
  const [view, setView] = useState(0);

  const props = propMap[view];

  const onChange = (e: React.FormEvent<HTMLInputElement>) => updateCallback({ [props.param]: e.currentTarget.value });

  // (props.value = e.currentTarget.value);

  const update = () => {
    // updateCallback({ [props.param]: props.value });
    // setState(state + 1);
    if (modalState < maxState) {
      onModalNext();
    } else {
      toggleModal();
    }
  };

  // useEffect(() => {
  //   setTimeout(() => ref.current && ref.current.focus(), 100);
  // }, []);
  // console.log(values)
  // const back = () => {
  //   // setState(state - 1);
  // };
  return (
    <div>
      <BiAnim state={state} changeView={() => setView(state)}>
        <div>
          <div className="modal__title">{props.cta}</div>
          <div className="modal__block">
            <div>
              <div className="modal__description">{props.description}</div>
              <div className="modal__input-container">
                <input
                  type="text"
                  onChange={onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      update()
                    }
                  }}
                  // autoFocus={true}
                  ref={ref}
                  value={values[props.param]}
                ></input></div>
            </div></div>
        </div>
      </BiAnim>
      <div className="modal__button-container">
        {/* <Button name="Back" onClick={back} /> */}
        <Button name="Ok" size="s" onClick={update} />
      </div>
    </div>
  );
}
