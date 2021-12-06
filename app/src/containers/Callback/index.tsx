import { useEffect } from "react";
import { discordAuth } from "../../firebase";

export default function Callback() {
  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    const code = params.get("code");
    discordAuth({ code });
  }, []);
  return <div>discord</div>;
}
