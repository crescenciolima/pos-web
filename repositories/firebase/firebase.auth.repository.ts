import { AuthErrorBuilder } from "../../builders/auth-error.builder";
import { UserBuilder } from "../../builders/user.builder";
import { authAdmin } from "../../firebase/firebase-admin";
import fire from "../../firebase/firebase-util";
import { AuthError } from "../../models/auth.error";
import { User } from "../../models/user";
import { AuthRepository } from "../auth.repository";

export class FirebaseAuthRepository implements AuthRepository{
   
    async signUp(user: User): Promise<User | AuthError> {
        return fire.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then(async (response) => {
                return new UserBuilder()
                    .register(response.user)
                    .id(response.user.uid)
                    .token(await this.getToken(response.user))
                .build();
            })
            .catch(async (err) => {
                console.error('Error on signUp', err);
                return new AuthErrorBuilder()
                    .message(err.code)
                .build();
        });
    }

    async signIn(user: User): Promise<User | AuthError> {
        return fire.auth().signInWithEmailAndPassword(user.email, user.password).then(async (userCredential) => {
            return new UserBuilder()
                .register(userCredential.user)
                .id(userCredential.user.uid)
                .token(await this.getToken(userCredential.user))
            .build();
        })
        .catch(async (err) => {
            console.error('Error on signIn', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }

    async signOut(): Promise<boolean | AuthError> {
        return fire.auth().signOut().then(async () => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on signOut', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async removeUser(user: User): Promise<boolean | AuthError> {
        return authAdmin.deleteUser(user.id).then(async () => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on removeUser', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async forgotPassword(user: User): Promise<boolean | AuthError> {
        return fire.auth().sendPasswordResetEmail(user.email, {url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/reset-password`}).then(async (userCredential) => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on forgotPassword', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async verifyPasswordResetCode(code: string): Promise<string | AuthError> {
        return fire.auth().verifyPasswordResetCode(code).then(async (email) => {
            return email;
        })
        .catch(async (err) => {
            console.error('Error on verifyPasswordResetCode', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async confirmPasswordReset(code: string, newPassword: string): Promise<boolean | AuthError> {
        return fire.auth().confirmPasswordReset(code, newPassword).then(async (userCredential) => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on confirmPasswordReset', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async updateUser(user: User): Promise<boolean | AuthError> {
        return authAdmin.updateUser(user.id, {password: user.password}).then(async () => {
            return true;
        })
        .catch(async (err) => {
            console.error('Error on updateUser', err);
            return new AuthErrorBuilder()
                .message(err.code)
            .build();
        });
    }
    async currentUser(authorization: string): Promise<string | boolean> {
        if (!authorization){
            return false;
        }
    
        try {
            const result = await this.verifyIdToken(authorization);
            return result.uid;
        } catch (err) {
            console.error('Error on verifyIdToken', err);
            return false;
        }
    }
    
    async verifyIdToken(token: string) {
        return await authAdmin.verifyIdToken(token);
    }

    private async getToken(user){
        const decodedToken = await user.getIdTokenResult(true);
        return decodedToken.token;
    }
    
}