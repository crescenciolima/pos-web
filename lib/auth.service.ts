import { Course } from "../models/course";
import { User } from "../models/user";
import fire from "../utils/firebase-util";
import { authAdmin } from "../utils/firebase-admin";
import firebase from "firebase";
import { NextApiRequest } from "next";
import firestore from "../utils/firestore-util";

export default function AuthService() {

    async function signUp(user: User) {
        return fire.auth().createUserWithEmailAndPassword(user.email, user.password).then(async (response) => {
            console.log(response.user);
            return await formatUser(response.user);
        });
    }

    async function signIn(user: User) {
        return fire.auth().signInWithEmailAndPassword(user.email, user.password).then(async (userCredential) => {
            return await formatUser(userCredential.user);
        });
    }

    
    async function signOut() {
        return fire.auth().signOut().then(async () => {
            return true;
        });
    }

    async function removeUser(user: User) {
        return authAdmin.deleteUser(user.id).then(async () => {
            return true;
        });
    }

    async function currentUser() {
        return firestore.app.auth().currentUser;
    }

    const checkAuthentication = async () => {
        if(!firestore.app.auth().currentUser){
            return false;
        }
        /*const authorization = req.headers.authorization;
        
        if (!authorization){
            return false;
        }
    
        try {
            await authAdmin.verifyIdToken(authorization);
        } catch (err) {
            console.log(err);
            return false;
        }*/

        return true;
    } 


    const formatUser = async (user: firebase.User) => {
        const decodedToken = await user.getIdTokenResult(true);
        const { token } = decodedToken;
        const userFormat: User = {
          id: user.uid,
          email: user.email,
          token,
        };
        return userFormat;
    };

    return {
        signUp,
        signIn,
        checkAuthentication,
        signOut,
        removeUser,
        currentUser
    }

}

