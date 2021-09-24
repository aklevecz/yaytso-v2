import Button from "../../components/Button";
import { useModalToggle } from "../../contexts/ModalContext";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import firebase from "firebase";
import { BiAnim } from "./Transitions";
import { useLogin } from "../../contexts/UserContext";
import LoadingButton from "../../components/Button/LoadingButton";
import ChevronLeft from "../../components/icons/ChevronLeft";

type PhoneProps = {
  phone: string;
  setPhone: Dispatch<SetStateAction<string>>;
  submitPhone: () => void;
  loading: boolean;
};

const PhoneNumber = ({ phone, setPhone, submitPhone, loading }: PhoneProps) => {
  return (
    <div>
      <div className="modal__description">
        Enter your phone number and you will be texted a sign in code
      </div>
      <div className="modal__input-container">
        <PhoneInput
          className="phone-input"
          placeholder="Your phone number"
          country="US"
          defaultCountry="US"
          value={phone}
          onChange={setPhone}
        />
      </div>
      <div className="modal__button-container">
        {!loading ? (
          <Button disabled={!phone} name="Submit" size="s" onClick={submitPhone} />
        ) : (
          <LoadingButton color="white" size="s" />
        )}
      </div>
    </div>
  );
};

type ConfirmProps = {
  onCodeChange: (e: React.FormEvent<HTMLInputElement>) => void;
  confirmCode: () => void;
  retry: () => void;
  loading: boolean;
  code: string,
  error: string,
};

const Confirm = ({ onCodeChange, confirmCode, retry, loading, code, error }: ConfirmProps) => {
  return (
    <div>
      <div className="modal__description">
        Enter the 6 digit code that was just texted to you below!
      </div>

      <div className="modal__input-container">
        <input
          type="text"
          style={{ margin: "auto", display: "block" }}
          onChange={onCodeChange}
        ></input>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {!loading ? (
          <div className="modal__button-container--stacked">
            <Button disabled={code.length < 6} size="s" name="Confirm" onClick={confirmCode} />
            {error && <Button name="Resend Code" onClick={retry} />}
          </div>
        ) : (
          <LoadingButton color="white" size="s" />
        )}
      </div>
    </div>
  );
};

enum Step {
  Phone,
  Confirm,
}

const initialStep = Step.Phone;
// const initialPhoneNumber = "+14159671642";
const initialPhoneNumber = "";

// This should be refactored to use the modal state shit
export default function Login() {
  const [loading, setLoading] = useState(false);
  const { toggleModal } = useModalToggle();
  const { login } = useLogin();
  const [phone, setPhone] = useState(initialPhoneNumber);
  const [confirmationResult, setConfirmationResult] =
    useState<firebase.auth.ConfirmationResult>();
  const [code, setCode] = useState("");
  const [state, setState] = useState(initialStep);
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState("");
  useEffect(() => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "submit-phone",
      {
        size: "invisible",
        callback: (response: any) => {
          //   console.log(response);
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          //     onSignInSubmit();
        },
      }
    );
  }, []);

  useEffect(() => {
    setError("")
  }, [state])

  const errorMessageMap: { [key: string]: string } = {
    "TOO_SHORT": "Your phone number is too short-- are you missing a number or two?",
    "Invalid format.": "Your phone number looks weird-- maybe try again?"
  }


  const submitPhone = () => {
    if (!phone) return;
    setLoading(true);
    const appVerifier = (window as any).recaptchaVerifier;
    firebase
      .auth()
      .signInWithPhoneNumber(phone, appVerifier)
      .then((confirmResult) => {
        setLoading(false);
        setConfirmationResult(confirmResult);
        setState(Step.Confirm);
      })
      .catch((err) => {
        try {
          setError(errorMessageMap[err.message]);
        } catch (e) {
        }
        setLoading(false);
        (window as any).recaptchaVerifier.render().then(function (widgetId: any) {
          (window as any).grecaptcha.reset(widgetId);
        })
      });
  };

  const onCodeChange = (e: React.FormEvent<HTMLInputElement>) =>
    setCode(e.currentTarget.value);

  const confirmCode = () => {
    if (!confirmationResult) {
      return;
    }
    if (!code) {
      return;
    }
    setLoading(true);
    confirmationResult.confirm(code).then((result) => {
      if (!result.user) {
        return console.error("user is missing");
      }
      setLoading(false);
      login(result.user);
      toggleModal();
    }).catch(err => {
      if (err.code === "auth/invalid-verification-code") {
        setError("Hmm that isn't the right code-- try again?")
      }
      setLoading(false)
    });
  };

  return (
    <div>        {step > Step.Phone && (
      <div onClick={() => setState(state - 1)} className="modal__back">
        <ChevronLeft />
      </div>
    )}
      <div className="modal__title">

        Login
      </div>
      <BiAnim state={state} changeView={() => setStep(state)}>
        <div className="">
          <React.Fragment>
            {step === Step.Phone && (
              <PhoneNumber
                phone={phone}
                setPhone={setPhone}
                submitPhone={submitPhone}
                loading={loading}
              />
            )}
            {step === Step.Confirm && (
              <Confirm
                onCodeChange={onCodeChange}
                confirmCode={confirmCode}
                retry={submitPhone}
                loading={loading}
                code={code}
                error={error}
              />
            )}
          </React.Fragment>
          <div className="modal__error">{error && error}</div>
        </div>
      </BiAnim>
      <span id="submit-phone" />
    </div>
  );
}
