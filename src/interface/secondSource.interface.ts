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
    verification?: {
        code: string;
        generatedAt: Date;
    };
    acceptTcleIn?: Date;
    acceptTaleIn?: Date;
    teacherSubject?: string;
    adultFormCurrentStep?: EAdultFormSteps;
    adultFormAnswers?: IQuestionsGroup[];
    startFillFormDate?: string;
    endFillFormDate?: string;
    createdAt?: string;
}
