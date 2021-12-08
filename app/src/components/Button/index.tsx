export type Sizes = "xs" | "s" | "md" | "lg" | "flex" | "flex2" | "";

type Props = {
  name: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  size?: Sizes;
  id?: string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  margin?: number | string;
  padding?: number | string;
  display?: string;
  background?: string;
  disabled?: boolean;
};

export default function Button({
  name,
  onClick,
  className,
  size,
  id,
  width,
  height,
  maxWidth,
  margin,
  padding,
  display,
  background,
  disabled,
}: Props) {
  return (
    <button
      id={id}
      className={`btn ${className} ${size} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      style={{ margin, padding, width, height, maxWidth, display, background }}
      disabled={disabled}
    >
      {name}
    </button>
  );
}
