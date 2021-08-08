import { Student } from "../models/student";
import firestore from "../utils/firestore-util";


export default function StudentService() {

    const studentRef = firestore.collection("student");

    async function save(student: Student) {
        return studentRef.add(student);
    }

    async function update(student: Student) {
        studentRef.doc(student.id).set(student);
    }

    async function remove(student: Student) {
        studentRef.doc(student.id).delete();
    }

    async function getById(id: any) {
        let snapshot = await studentRef.doc(id).get();
        const doc = snapshot.data();
        const student: Student = {
            id: id,
            name: doc['name'],
            document: doc['document'],
            identityDocument: doc['identityDocument'],
            issuingAgency: doc['issuingAgency'],
            issuanceDate: doc['issuanceDate'],
            birthdate: doc['birthdate'],
            postalCode: doc['postalCode'],
            street: doc['street'],
            houseNumber: doc['houseNumber'],
            complement: doc['complement'],
            district: doc['district'],
            city: doc['city'],
            state: doc['state'],
            phoneNumber: doc['phoneNumber'],
            homePhoneNumber: doc['homePhoneNumber'],
            graduation: doc['graduation'],
            graduationInstitution: doc['graduationInstitution'],
            postgraduateLatoSensu: doc['postgraduateLatoSensu'],
            postgraduateLatoSensuInstitution: doc['postgraduateLatoSensuInstitution'],
            postgraduateStrictoSensu: doc['postgraduateStrictoSensu'],
            postgraduateStrictoSensuInstitution: doc['postgraduateStrictoSensuInstitution'],
        
            profession: doc['profession'],
            company: doc['company'],
            postalCodeCompany: doc['postalCodeCompany'],
            streetCompany: doc['streetCompany'],
            houseNumberCompany: doc['houseNumberCompany'],
            complementCompany: doc['complementCompany'],
            districtCompany: doc['districtCompany'],
            cityCompany: doc['cityCompany'],
            stateCompany: doc['stateCompany'],
            phoneNumberCompany: doc['phoneNumberCompany'],
            workShift: doc['workShift'],
            workRegime: doc['workRegime'],        
        }

        return student;
    }


    return {
        save,
        update,
        remove,
        getById
    }

}

