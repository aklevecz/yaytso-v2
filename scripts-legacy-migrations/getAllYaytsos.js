const { db } = require("./firebase");

db.collection("YAYTSOS").get().then(console.log);
