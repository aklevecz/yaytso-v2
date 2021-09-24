import Button from ".";

type Props = {
  name: string;
  width?: number;
};

export default function FlexButton({ name, width }: Props) {
  return (
    <Button
      size="flex"
      name={name}
      width={width}
      onClick={() => console.log("hi")}
    />
  );
}
