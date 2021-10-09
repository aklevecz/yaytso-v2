import baoImg from "../../assets/bao.png";

export default function Loser() {
  return (
    <div className="guestlist__container">
      <div className="guestlist__heading">You won!</div>
      <div className="guestlist__text">
        Well not a guestlist spot, but a picture of Bao!
      </div>
      <img src={baoImg} />
      <div className="guestlist__text">Better luck next time sucker! :)</div>
    </div>
  );
}
