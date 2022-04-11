import * as admin from 'firebase-admin';
import firebase from 'firebase';
import FirebaseAdminSdkCredentials from './credentials-firebase-adminsdk';

export class FirebaseAdmin{
  static firebaseAdmin:FirebaseAdmin;
  static getInstance():FirebaseAdmin{
      if(!FirebaseAdmin.firebaseAdmin){
          FirebaseAdmin.firebaseAdmin = new FirebaseAdmin();
      }
      return FirebaseAdmin.firebaseAdmin;
  }
  firestore;
  authAdmin;
  fire;
  constructor(){
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(JSON.stringify(FirebaseAdminSdkCredentials))),
        databaseURL: `https://${process.env.FB_PROJECT_ID}.firebaseio.com`,
      });
    }
    const firebaseConfig = {
      apiKey: process.env.FB_API_KEY,
      authDomain: process.env.FB_AUTH_DOMAIN,
      projectId: process.env.FB_PROJECT_ID,
      storageBucket: process.env.FB_STORAGE_BUCKET,
      messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
      appId: process.env.FB_APP_ID
    };
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (err) {
      if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
      }
    }
    this.firestore = admin.firestore();
    this.authAdmin = admin.auth();
    this.fire = firebase;
  }
}