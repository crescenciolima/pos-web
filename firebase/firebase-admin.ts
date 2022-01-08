import * as admin from 'firebase-admin';
import FirebaseAdminSdkCredentials from './credentials-firebase-adminsdk';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(JSON.stringify(FirebaseAdminSdkCredentials))),
    databaseURL: `https://${process.env.FB_PROJECT_ID}.firebaseio.com`,
  });
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { firestore, authAdmin }