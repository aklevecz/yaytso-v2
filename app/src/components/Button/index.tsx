export type Sizes = "xs" | "s" | "md" | "lg" | "flex" | "flex2" | "";

type Props = {
  name?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  size?: Sizes;
  id?: string;
  fontSize?: number | string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  margin?: number | string;
  padding?: number | string;
  display?: string;
  background?: string;
  disabled?: boolean;
  children?: JSX.Element | JSX.Element[] | string;
};

export default function Button({
  name,
  onClick,
  className,
  size,
  id,
  fontSize,
  width,
  height,
  maxWidth,
  margin,
  padding,
  display,
  background,
  disabled,
  children,
}: Props) {
  return (
    <button
      id={id}
      className={`btn ${className} ${size} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      style={{
        margin,
        padding,
        width,
        height,
        maxWidth,
        display,
        background,
        fontSize,
      }}
      disabled={disabled}
    >
      {name ? name : children}
    </button>
  );
}
