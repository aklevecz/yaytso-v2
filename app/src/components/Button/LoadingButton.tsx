import { Sizes } from ".";

type Props = {
  color: string;
  size?: Sizes;
};

export default function LoadingButton({ color, size }: Props) {
  return (
    <button className={`btn ${size}`} style={{ background: "black" }}>
      {/* <div className="dot-elastic"></div> */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="dot-typing"></div>
      </div>
    </button>
  );
}
