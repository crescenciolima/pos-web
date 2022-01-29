import * as admin from 'firebase-admin';
import firebase from 'firebase';

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
  
  private convertLineBreaks(key:string) {
    while(key.includes("\\n")){
        key = key.replace("\\n","\n");
    }
    return key
  }

  constructor(){
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(JSON.stringify({
          "type": "service_account",
          "project_id": process.env.FB_PROJECT_ID,
          "private_key_id": process.env.FB_ADMIN_PRIVATE_KEY_ID,
          "private_key": this.convertLineBreaks(process.env.FB_ADMIN_PRIVATE_KEY.toString()),
          "client_email": process.env.FB_ADMIN_CLIENT_EMAIL,
          "client_id": process.env.FB_ADMIN_CLIENT_ID,
          "auth_uri": process.env.FB_ADMIN_AUTH_URI,
          "token_uri": process.env.FB_ADMIN_TOKEN_URI,
          "auth_provider_x509_cert_url": process.env.FB_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
          "client_x509_cert_url": process.env.FB_ADMIN_CLIENT_X509_CERT_URL
        }))),
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