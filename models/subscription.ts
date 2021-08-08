import { Student } from "./student";
import { User } from "./user";

export interface Subscription {
    id?: string
    student: Student;
    protocol?: string;
    handicapped: boolean;
    disabilityType?: string;
    specialTreatmentType?: string[];
    vacancyType: string;    
    status: string;
}