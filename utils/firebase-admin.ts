import * as admin from 'firebase-admin';
var serviceAccount = require("../firebase/credentials-firebase-adminsdk.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FB_PROJECT_ID}.firebaseio.com`,
  });
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { firestore, authAdmin }