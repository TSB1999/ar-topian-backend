import * as admin_ from "firebase-admin";
export const admin = admin_;
admin.initializeApp();
export const db = admin.firestore();

// module.exports = { admin, db };
