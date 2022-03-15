import React, { useState } from "react";
import { getSecret } from ".";
import Button from "../../components/Button";
import LoadingButton from "../../components/Button/LoadingButton";
import { BACKEND_HOST } from "../../constants";
import { validateEmail } from "../../utils";
import baoImg from "../../assets/bao.png";
type Props = {
  search: string;
  isWinner: boolean;
};

export default function Winner({ search, isWinner }: Props) {
  const [fetching, setFetching] = useState(false);
  const [done, setDone] = useState(isWinner);
  const [email, setEmail] = useState("");
  const onChange = (e: React.FormEvent<HTMLInputElement>) =>
    setEmail(e.currentTarget.value);
  const sendIt = () => {
    setFetching(true);
    const code = new URLSearchParams(search).get("code");
    const secret = getSecret();
    fetch(`${BACKEND_HOST}/guestlist`, {
      method: "POST",
      body: JSON.stringify({ email, secret, code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDone(true);
        }
        setFetching(false);
      });
  };
  const disabled = validateEmail(email);
  return (
    <div className="guestlist__container">
      {/* {!done && ( */}
      <>
        <div className="guestlist__heading" style={{ background: "#64ff24" }}>
          You won!
        </div>
        <div className="guestlist__text">
          You will be on the guestlist for MONA X Volta on a day of your choice!
        </div>
        <div className="guestlist__text">I will contact you shortly :)</div>
        {/* <div className="guestlist__text">
            Leave your email below & I will contact you with additional details
            :)
          </div>
          <input
            placeholder="Email"
            onChange={onChange}
            type="text"
            name="email"
          />
          <div
            style={{ marginTop: 16, display: "flex", justifyContent: "center" }}
          >
            {!fetching ? (
              <Button disabled={!disabled} onClick={sendIt}>
                Send it
              </Button>
            ) : (
              <LoadingButton color="white" />
            )}
          </div> */}
      </>
      {/* )} */}
      {/* {done && (
        <>
          <div className="guestlist__heading">See you there :)</div>
          <img style={{ marginTop: 16 }} src={baoImg} />
        </>
      )} */}
    </div>
  );
}
