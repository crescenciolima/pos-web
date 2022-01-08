import { Course } from "../models/course";
import { User } from "../models/user";
import fire from "../utils/firebase-util";
import { authAdmin } from "../firebase/firebase-admin";
import firebase from "firebase";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestWithFormData } from "../utils/types-util";

export default function AuthService() {

    async function signUp(user: User,  res: NextApiResponse) {
        return fire.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then(async (response) => {
                return await formatUser(response.user);
            })
            .catch(async (err) => {
                console.error('Error on signUp', err);
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
            console.error('Error on signIn', err);
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
            console.error('Error on signOut', err);
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
            console.error('Error on removeUser', err);
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function forgotPassword(user: User) {
        return fire.auth().sendPasswordResetEmail(user.email, {url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/reset-password`}).then(async (userCredential) => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on forgotPassword', err);
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
            console.error('Error on verifyPasswordResetCode', err);
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
            console.error('Error on confirmPasswordReset', err);
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function updateUser(user: User) {
        return authAdmin.updateUser(user.id, {password: user.password}).then(async () => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on updateUser', err);
            return {
                error: true,
                message: err.code
            }
        });
    }

    async function currentUser(authorization: string) {
        if (!authorization){
            return false;
        }
    
        try {
            const result = await authAdmin.verifyIdToken(authorization);
            console.log('Current User by verifyIdToken', result);
            return result.uid;
        } catch (err) {
            console.error('Error on verifyIdToken', err);
            return false;
        }
    }

    const checkAuthentication = async (req: NextApiRequest|NextApiRequestWithFormData) => {
        return await currentUser(req.headers.authorization);
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
        confirmPasswordReset,
        updateUser,
    }

}

