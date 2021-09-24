import { useEffect, useRef, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

type AnimProps = {
  children: JSX.Element | JSX.Element[];
  state: number;
  changeView: () => void;
};

export const BiAnim = ({ children, state, changeView }: AnimProps) => {
  const [nonce, setNonce] = useState(0);
  const [transitionClass, setTransitionClass] = useState("slide");
  const [prevState, setPrevState] = useState(state);
  const firstRender = useRef(true);

  useEffect(() => {
    setTransitionClass(`slide${prevState > state ? "-back" : ""}`);
    setPrevState(state);
    // eslint-disable-next-line
  }, [state]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setNonce(nonce + 1);
    // eslint-disable-next-line
  }, [prevState]);

  return (
    <SwitchTransition>
      <CSSTransition
        key={nonce}
        addEndListener={(node, done) => {
          changeView();
          node.addEventListener("transitionend", done, false);
        }}
        classNames={transitionClass}
      >
        {children}
      </CSSTransition>
    </SwitchTransition>
  );
};
