import { useState } from "react";
import { ipfsLink } from "../../utils";

type Props = {
	cid: string;
	navigateToEgg: () => void;
}

export default function EggImg({ cid, navigateToEgg }: Props) {
	const [loaded, setLoaded] = useState(false)
	return (
		<>
			{!loaded && <div className="loading-dot__jank-container">
				<div className="dot-typing-inverse"></div></div>}
			<img onClick={navigateToEgg} src={ipfsLink(cid)} onLoad={() => setLoaded(true)} style={{ display: loaded ? "block" : "none" }} />
		</>
	)
}