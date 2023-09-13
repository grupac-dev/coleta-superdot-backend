import { EAdultFormSteps, EducationLevelType, RelationshipsType, TRelationshipTime } from "../util/consts";
import IQuestionsGroup from "./adultForm/questionsGroup.interface";

export interface ISecondSource {
    _id?: string;
    personalData: {
        email: string;
        fullName: string;
        birthDate?: Date;
        relationship: RelationshipsType;
        relationshipTime?: TRelationshipTime;
        job?: string;
        occupation?: string;
        street?: string;
        district?: string;
        countryCity?: string;
        phone?: string;
        educationLevel?: EducationLevelType;
    };
    indicated?: boolean;
    acceptTcle?: boolean;
    acceptTale?: boolean;
    teacherSubject?: string;
    adultFormCurrentStep?: EAdultFormSteps;
    adultFormAnswers?: IQuestionsGroup[];
    endFillFormDate?: string;
    createdAt?: string;
}
