import Button, { Sizes } from ".";
import Number from "../icons/Number";
import IconWrapper from "./IconWrapper";
import InnerButtonContainer from "./InnerButtonContainer";

type Props = {
  size?: Sizes;
  onClick: () => void;
  text?: string;
};

export default function LoginButton({
  size = "flex2",
  text = "Sign in with your phone",
  onClick,
}: Props) {
  return (
    <Button size={size} margin="10px auto" display="block" onClick={onClick}>
      <InnerButtonContainer>
        <IconWrapper>
          <Number />
        </IconWrapper>
        <div>{text}</div>
      </InnerButtonContainer>
    </Button>
  );
}
