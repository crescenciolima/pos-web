import { Course } from "../models/course";
import { User } from "../models/user";
import fire from "../utils/firebase-util";
import { authAdmin } from "../utils/firebase-admin";
import firebase from "firebase";
import { NextApiRequest } from "next";
import firestore from "../utils/firestore-util";

export default function AuthService() {

    async function signUp(user: User) {
        return fire.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then(async (response) => {
                return await formatUser(response.user);
            })
            .catch(async (err) => {
                return {
                    error: true,
                    message: err.code
                }
            });
    }

    async function signIn(user: User) {
        return fire.auth().signInWithEmailAndPassword(user.email, user.password).then(async (userCredential) => {
            return await formatUser(userCredential.user);
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    
    async function signOut() {
        return fire.auth().signOut().then(async () => {
            return true;
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function removeUser(user: User) {
        return authAdmin.deleteUser(user.id).then(async () => {
            return true;
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function forgotPassword(user: User) {
        return fire.auth().sendPasswordResetEmail(user.email, {url: 'http://localhost:3000/reset-password'}).then(async (userCredential) => {
            return true;
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function verifyPasswordResetCode(code: string) {
        return fire.auth().verifyPasswordResetCode(code).then(async (email) => {
            return email;
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function confirmPasswordReset(code: string, newPassword: string) {
        return fire.auth().confirmPasswordReset(code, newPassword).then(async (userCredential) => {
            return true;
        })
        .catch(async (err) => {
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function currentUser() {
        return firestore.app.auth().currentUser;
        /*const authorization = req.cookies;
        console.log('teste server');
        console.log(authorization);
        if (!authorization){
            return false;
        }
    
        try {
            const result = await authAdmin.verifyIdToken(authorization);
            console.log(result);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }*/

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
        forgotPassword,
        currentUser,
        verifyPasswordResetCode,
        confirmPasswordReset
    }

}

