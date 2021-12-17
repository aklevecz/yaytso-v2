import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import DotTyping from "../../components/Loading/DotTyping";
import { auth, discordAuth } from "../../firebase";

export default function Callback() {
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    const code = params.get("code");
    if (code) {
      discordAuth({ code }).then((r) => {
        console.log(r);
        if (r.data.discordConnected) {
          history.push("/wallet");
        }
        if (r.data.loginToken) {
          auth.signInWithCustomToken(r.data.loginToken).then(() => {
            history.push("/wallet");
          });
        }
      });
    } else {
      history.push("/");
    }
  }, []);
  return <div style={{ height: "90vh" }}>{loading && <DotTyping />}</div>;
}
