const admin = require("firebase-admin/app");
const serviceAccount = require("./firebase-admin.json");
const { getFirestore } = require("firebase-admin/firestore");

const app = admin.initializeApp({ credential: admin.cert(serviceAccount) });
const db = getFirestore(app);

module.exports = {
  db,
};
