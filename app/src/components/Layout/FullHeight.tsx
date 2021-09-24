import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { NAV_CLASS_NAME } from "../../constants";

const windowHeight = window.innerHeight

export default function LayoutFullHeight({ children }: { children: JSX.Element | JSX.Element[] }) {
	const location = useLocation();
	const [height, setHeight] = useState(0)

	const checkHeight = () => {
		const navEl = document.querySelector(`.${NAV_CLASS_NAME}`) as HTMLDivElement;
		if (navEl) {
			const navHeight = navEl.clientHeight;
			const fullHeight = windowHeight - navHeight
			setHeight(fullHeight);
		}
	}

	useEffect(() => {
		// setTimeout(checkHeight, 100)
		checkHeight()
		window.scrollTo(0, 0)
	}, [location]);
	return (
		<div style={{ height, display: "flex", justifyContent: "center", overflow: "hidden" }} className="layout-fullheight__container">{children}</div>
	)
}