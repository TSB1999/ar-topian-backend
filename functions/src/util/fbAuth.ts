import { db, admin } from "./admin";

export const fbAuth = (req: any, res: any, next: any) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken: any) => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data: any) => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch((err: any) => {
      console.error("Error while verifying token ", err);
      return res.status(400).json(err);
    });
};