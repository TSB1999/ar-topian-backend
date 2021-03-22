const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./util/fb_auth");

app.get("/hello", (req, res) => {
  return res.json({ message: "hello world" });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
