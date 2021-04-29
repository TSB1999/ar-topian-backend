import firebase from "firebase";
import db from "../util/admin";
import config from "../util/config";

import {
  validateRegistrationData,
  validateLogInData,
} from "../util/validators";

firebase.initializeApp(config);

export const login = (req: any, res: any) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLogInData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data: any) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code == "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else if (err.code == "auth/user-not-found") {
        return res
          .status(403)
          .json({ general: "User not found, please try again" });
      }
      return res.status(500).json({ error: err.code });
    });
};

export const register = (req: any, res: any) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username,
  };

  const { valid, errors } = validateRegistrationData(newUser);

  if (!valid) return res.status(400).json(errors);

  let token: string, userId: string;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc: any) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then((data: any) => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then((idToken) => {
            token = idToken;
            const userCredentials = {
              username: newUser.username,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId,
            };

            db.doc(`/users/${newUser.username}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch((err) => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
              return res
                .status(400)
                .json({ email: "e-mail is already in use" });
            } else if (err.code === "auth/weak-password") {
              return res
                .status(400)
                .json({ email: "password must be stronger" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });
};

interface UserObject {
  [key: string]: any;
}

export const getAuthenticatedUser = (req: any, res: any) => {
  let userData: UserObject = {};
  db.doc(`/users/${req.user.username}`)
    .get()
    .then((doc) => {
      userData.credentials = doc.data();
      return db
        .collection("orders")
        .where("user", "==", req.user.username)
        .get();
    })
    .then((data) => {
      userData.orders = [];
      data.forEach((doc: any) => {
        userData.orders.push(doc.data());
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

export const getUserDetails = (req: any, res: any) => {
  let userData: UserObject = {};
  db.doc(`/users/${req.params.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("orders")
          .where("user", "==", req.params.username)
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then((data) => {
      userData.orders = [];
      data.forEach((doc: any) => {
        userData.orders.push(doc.data());
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
