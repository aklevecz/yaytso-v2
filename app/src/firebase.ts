import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

const firebaseConfig = require("./firebase-config.json");

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

if (process.env.NODE_ENV === "development") {
  db.settings({
    host: "localhost:8081",
    ssl: false,
  });
  firebase.functions().useEmulator("http://localhost", 5002);
}

const CARTONS = "CARTONS";
const YAYTSOS = "YAYTSOS";

export { CARTONS, YAYTSOS };
export { auth, db };
