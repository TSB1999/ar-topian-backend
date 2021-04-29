import * as functions from "firebase-functions";
import * as express from "express";

const app = express();

import FBAuth from "./util/fbAuth";

import {
  login,
  register,
  getAuthenticatedUser,
  getUserDetails,
} from "./handlers/users";
import { getAllItems, addItem, addOrder, updateOrder } from "./handlers/items";

app.post("/register", register);
app.post("/login", login);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:username", getUserDetails);

app.post("/item", FBAuth, addItem);
app.post("/order", FBAuth, addOrder);
app.post("/order/update/:username", FBAuth, updateOrder);
app.get("/items", getAllItems);
//shop item routes --> copy card  route and edit

export const api = functions.region("europe-west1").https.onRequest(app);
