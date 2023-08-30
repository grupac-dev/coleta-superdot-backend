import { EducationLevelType, RelationshipsType } from "../util/consts";

export interface ISecondSource {
    _id?: string;
    personalData: {
        fullName: string;
        email: string;
        birthDate?: Date;
        relationship: RelationshipsType;
        job?: string;
        occupation?: string;
        phone?: string;
        educationLevel?: EducationLevelType;
    };
    teacherSubject?: string;
}
