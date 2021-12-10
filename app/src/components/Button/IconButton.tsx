import React from "react";

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: JSX.Element;
}

export default function IconButton({ children, ...props }: Props) {
  return (
    <button {...props} style={{ border: "none", background: "none" }}>
      {children}
    </button>
  );
}
