import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import DotTyping from "../../components/Loading/DotTyping";
import { useWallet } from "../../contexts/WalletContext";
import { discordAuth } from "../../firebase";

export default function Callback() {
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    const code = params.get("code");
    if (code) {
      discordAuth({ code }).then((r) => {
        if (r) {
          history.push("/wallet");
        }
      });
    } else {
      history.push("/");
    }
  }, []);
  return <div style={{ height: "90vh" }}>{loading && <DotTyping />}</div>;
}
