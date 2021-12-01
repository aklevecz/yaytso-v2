import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(config);
const db = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.functions();

if (process.env.NODE_ENV === "development") {
  db.settings({
    host: "localhost:8081",
    ssl: false,
  });
  functions.useEmulator("localhost", 5002);
  auth.useEmulator("http://localhost:9099");
}

export enum Collections {
  Users = "Users",
  Cartons = "CARTONS",
  Yaytso = "YAYTSOS",
  NFT = "NFTS",
  TxLogs = "TxLogs",
}

const CARTONS = "CARTONS";
const YAYTSOS = "YAYTSOS";

export { CARTONS, YAYTSOS };
export { auth, db };

const onSignIn = functions.httpsCallable("onSignIn");
const onCreateEggvatar = functions.httpsCallable("onCreateEggvatar");
const discordAuth = functions.httpsCallable("discord-auth");

export { onSignIn, onCreateEggvatar, discordAuth };
