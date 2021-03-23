const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./util/fb_auth");

const { login, register } = require("./handlers/users");

app.post("/register", register);
app.post("/login", login);

exports.api = functions.region("europe-west1").https.onRequest(app);
