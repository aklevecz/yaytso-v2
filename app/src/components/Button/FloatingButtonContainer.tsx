type Props = {
  children: JSX.Element | JSX.Element[];
  top?: string | number;
  bottom?: string | number;
  right?: string | number;
  marginRight?: string | number;
};

export default function FloatingButtonContainer({
  children,
  top,
  bottom,
  right,
  marginRight
}: Props) {
  return (
    <div style={{ top, bottom, right, marginRight }} className="floating-button-container">
      {children}
    </div>
  );
}
