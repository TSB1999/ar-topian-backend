const { db } = require("../util/admin");

const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateRegistrationData,
  validateLogInData,
} = require("../util/validators");

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLogInData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
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

exports.register = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username,
  };

  const { valid, errors } = validateRegistrationData(newUser);

  if (!valid) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then((data) => {
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
