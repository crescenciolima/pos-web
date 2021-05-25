import { Course } from "../models/course";
import { User } from "../models/user";
import fire from "../utils/firebase-util";



export default function AuthService() {

    async function signUp(user: User) {
        console.log(user);
        fire.auth().createUserWithEmailAndPassword(user.email, user.password).then((response) => {
            return response.user;
        });
    }

    async function signIn(user: User) {
        return fire.auth().signInWithEmailAndPassword(user.email, user.password).then((userCredential) => {
            return formatUser(userCredential.user);
        });
    }

    const formatUser = async (user) => {
        const decodedToken = await user.getIdTokenResult(true);
        const { token, expirationTime } = decodedToken;
        return {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          provider: user.providerData[0].providerId,
          photoUrl: user.photoURL,
          token,
          expirationTime,
        };
      };

    return {
        signUp,
        signIn
    }

}

