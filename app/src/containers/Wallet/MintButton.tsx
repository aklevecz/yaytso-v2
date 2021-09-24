import Button from "../../components/Button";

type Props = {
  onClick: () => void;
};

export default function MintButton({ onClick }: Props) {
  return <Button name="Mint" onClick={onClick} size="flex" />;
}
