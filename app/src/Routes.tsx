import { useEffect } from "react"
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom";
import Map from "./containers/Map";
import Wallet from "./containers/Wallet";
import EggCreation from "./containers/EggCreation";
import Egg from "./containers/Egg"
import { ThreeProvider } from "./contexts/ThreeContext";
import { PatternProvider } from "./contexts/PatternContext";
import Nav from "./components/Nav";
import { useLoading } from "./contexts/UserContext";
import DotTyping from "./components/Loading/DotTyping";
import Modal from "./containers/Modal";

const noOverFlow = ['map', '', "egg"]

const AppComponents = () => {
  const location = useLocation()
  useEffect(() => {
    if (noOverFlow.includes(location.pathname.split("/")[1])) {
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden";
      (document.querySelector(".App") as HTMLDivElement).style.overflow = "hidden"
      document.getElementById("root")!.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = "auto"
      document.body.style.overflow = "auto";
      (document.querySelector(".App") as HTMLDivElement).style.overflow = "auto"
      document.getElementById("root")!.style.overflow = "auto"
    }
  }, [location])

  return (
    <Switch>
      <Route path="/egg/:eggId">
        <ThreeProvider>
          <Egg />
        </ThreeProvider>
      </Route>
      <Route path="/wallet">
        <Wallet />
      </Route>
      <Route path="/map" component={Map} />
      <Route path="/">
        <PatternProvider>
          <ThreeProvider>
            <EggCreation />
          </ThreeProvider>
        </PatternProvider>
      </Route>
    </Switch>)
};

export default function Routes() {
  const loading = useLoading();

  return (
    <Router>
      <Nav />
      {loading && <DotTyping />}
      {!loading && <AppComponents />}
      <Modal />
    </Router>
  );
}
