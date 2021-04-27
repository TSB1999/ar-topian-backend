import * as functions from "firebase-functions";
import * as express from "express";

const app = express();

import FBAuth from "./util/fbAuth";

import { login, register } from "./handlers/users";
import { getAllItems, addItem, addOrder } from "./handlers/items";

app.post("/register", register);
app.post("/login", login);

app.post("/item", FBAuth, addItem);
app.post("/order", FBAuth, addOrder);
app.get("/items", getAllItems);
//shop item routes --> copy card  route and edit

export const api = functions.region("europe-west1").https.onRequest(app);
