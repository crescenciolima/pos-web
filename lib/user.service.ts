import { User } from "../models/user";
import firestore from "../utils/firestore-util";


export default function UserService() {

    const userRef = firestore.collection("user");

    async function getAll() {
        let users = [];

        await userRef.get().then(
            (snapshot) => {

                snapshot.forEach(
                    (result) => {
                        const id = result.id;
                        const doc = result.data();
                        const user: User = {
                            id: id,
                            email: doc['email'],
                            name: doc['name'],
                            type: doc['type'],
                        }
                        users.push(user);
                    });

            }
        ).catch(
        );

        return users;

    }

    async function save(user: User) {
        userRef.add(user);
    }

    async function update(user: User) {
        userRef.doc(user.id).set(user);
    }

    async function remove(user: User) {
        userRef.doc(user.id).delete();
    }

    async function getById(id: any) {
        let snapshot = await userRef.doc(id).get();
        const doc = snapshot.data();
        const user: User = {
            id: id,
            email: doc['email'],
            name: doc['name'],
            type: doc['type'],
        }

        return user;
    }


    return {
        getAll,
        save,
        update,
        remove,
        getById
    }

}

