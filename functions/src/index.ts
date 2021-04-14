import * as functions from "firebase-functions";
import * as express from "express";

const app = express();

// import FBAuth from "./util/fb_auth";

import { login, register } from "./handlers/users";

app.post("/register", register);
app.post("/login", login);

export const api = functions.region("europe-west1").https.onRequest(app);
