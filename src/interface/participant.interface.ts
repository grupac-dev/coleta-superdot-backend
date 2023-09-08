import {
    DeviceType,
    EAdultFormSteps,
    EducationLevelType,
    GenderType,
    IncomeLevelType,
    MaritalStatusType,
} from "../util/consts";
import IQuestionsGroup from "./adultForm/questionsGroup.interface";
import { ISecondSource } from "./secondSource.interface";

export interface IParticipant {
    _id?: string;
    personalData: {
        fullName: string;
        phone: string;
        email: string;
        maritalStatus: MaritalStatusType;
        job: string;
        occupation: string;
        educationLevel: EducationLevelType;
        gender: GenderType;
        birthDate: Date;
    };
    familyData: {
        qttChildrens: number;
        qttSiblings: number;
        qttFamilyMembers: string;
        familyMonthIncome: IncomeLevelType;
        houseDevices?: DeviceType[];
        outsideHouseDevices?: DeviceType[];
    };
    addressData: {
        city: string;
        district: string;
        street: string;
        houseNumber: string;
    };
    acceptTcle?: boolean;
    acceptTale?: boolean;
    secondSources?: ISecondSource[];
    adultFormAnswers?: IQuestionsGroup[];
    adultFormCurrentStep?: EAdultFormSteps;
    autobiography?: {
        text?: string;
        videoUrl?: string;
    };
    endFillFormDate?: Date;
    giftdnessIndicators?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
