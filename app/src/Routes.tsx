import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import Map from "./containers/Map";
import Wallet from "./containers/Wallet";
import EggCreation from "./containers/EggCreation";
import Egg from "./containers/Egg";
import Claim from "./containers/Claim";
import { ThreeProvider } from "./contexts/ThreeContext";
import { PatternProvider } from "./contexts/PatternContext";
import Nav from "./components/Nav";
import { useLoading } from "./contexts/UserContext";
import DotTyping from "./components/Loading/DotTyping";
import Modal from "./containers/Modal";
import { MapProvider } from "./contexts/MapContext";
import Callback from "./containers/Callback";
import Guestlist from "./containers/Guestlist";
import All from "./containers/All";

const noOverFlow = ["map", "", "egg"];

const AppComponents = () => {
  const location = useLocation();
  useEffect(() => {
    if (noOverFlow.includes(location.pathname.split("/")[1])) {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      (document.querySelector(".App") as HTMLDivElement).style.overflow =
        "hidden";
      document.getElementById("root")!.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      (document.querySelector(".App") as HTMLDivElement).style.overflow =
        "auto";
      document.getElementById("root")!.style.overflow = "auto";
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/egg/:eggId">
        <ThreeProvider>
          <Egg />
        </ThreeProvider>
      </Route>
      <Route path="/claim/:signature/:boxId/:nonce">
        <ThreeProvider>
          <Claim />
        </ThreeProvider>
      </Route>
      <Route path="/wallet">
        <Wallet />
      </Route>
      <Route path="/map">
        <Map />
      </Route>
      <Route path="/callback">
        <Callback />
      </Route>
      <Route path="/hunt">
        <ThreeProvider>
          <Guestlist />
        </ThreeProvider>
      </Route>
      <Route path="/all">
        <All />
      </Route>
      <Route path="/">
        <PatternProvider>
          <ThreeProvider>
            <EggCreation />
          </ThreeProvider>
        </PatternProvider>
      </Route>
    </Switch>
  );
};

export default function Routes() {
  const loading = useLoading();
  // console.log(loading);
  return (
    <Router>
      <Nav />
      {/* <DotTyping /> */}
      {loading && <DotTyping />}
      {!loading && <AppComponents />}
      {/* <AppComponents /> */}
      <Modal />
    </Router>
  );
}
