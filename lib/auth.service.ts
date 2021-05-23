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
        fire.auth().signInWithEmailAndPassword(user.email, user.password);
    }

    return {
        signUp,
        signIn
    }

}

