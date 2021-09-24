type Props = {
  name: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function NavButton({ name, onClick }: Props) {
  return (
    <button className="btn round" onClick={onClick}>
      {name}
    </button>
  );
}
