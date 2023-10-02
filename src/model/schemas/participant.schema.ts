import { Schema } from "mongoose";
import { IParticipant } from "../../interface/participant.interface";
import {
    DEVICES_ARRAY,
    EAdultFormGroup,
    EAdultFormSteps,
    EDUCATION_LEVEL_ARRAY,
    GENDER_ARRAY,
    INCOME_LEVELS_ARRAY,
    MARITAL_STATUS_ARRAY,
} from "../../util/consts";
import { secondSourceSchema } from "./secondSource.schema";
import { questionSchema } from "../adultForm/schemas/question.schema";

export const participantSchema = new Schema<IParticipant>(
    {
        personalData: {
            fullName: {
                type: String,
                required: [true, "Participant full name is required!"],
            },
            phone: {
                type: String,
                required: [true, "Participant phone is required!"],
            },
            email: {
                type: String,
                required: [true, "Participant email is required!"],
            },
            maritalStatus: {
                type: String,
                enum: MARITAL_STATUS_ARRAY,
                required: [true, "Participant marital status is required!"],
            },
            job: {
                type: String,
                required: [true, "Participant job is required!"],
            },
            occupation: {
                type: String,
                required: [true, "Participant occupation is required!"],
            },
            educationLevel: {
                type: String,
                enum: EDUCATION_LEVEL_ARRAY,
                required: [true, "Participant education level is required!"],
            },
            gender: {
                type: String,
                enum: GENDER_ARRAY,
                required: [true, "Participant gender is required!"],
            },
            birthDate: {
                type: Date,
                required: [true, "Participant birthDate is required!"],
            },
        },
        familyData: {
            qttChildrens: {
                type: Number,
                required: [true, "Participant childrens quantity is required!"],
            },
            qttSiblings: {
                type: Number,
                required: [true, "Participant siblings quantity is required!"],
            },
            qttFamilyMembers: {
                type: String,
                required: [true, "Participant family members quantity is required!"],
            },
            familyMonthIncome: {
                type: String,
                enum: INCOME_LEVELS_ARRAY,
                required: [true, "Participant family month income is required!"],
            },
            houseDevices: {
                type: Array,
                of: String,
                enum: DEVICES_ARRAY,
            },
            outsideHouseDevices: {
                type: Array,
                of: String,
                enum: DEVICES_ARRAY,
            },
        },
        addressData: {
            city: {
                type: String,
                required: [true, "Participant city is required!"],
            },
            district: {
                type: String,
                required: [true, "Participant district is required!"],
            },
            street: {
                type: String,
                required: [true, "Participant street is required!"],
            },
            houseNumber: {
                type: String,
                required: [true, "Participant houseNumber is required!"],
            },
        },
        acceptTaleIn: Date,
        acceptTcleIn: Date,
        secondSources: [secondSourceSchema],
        adultFormAnswers: [
            {
                groupName: {
                    type: String,
                    required: [true, "Group name is required!"],
                },
                sequence: {
                    type: Number,
                    enum: EAdultFormGroup,
                    required: [true, "Group sequence is required!"],
                },
                questions: [questionSchema],
            },
        ],
        endFillFormDate: Date,
        adultFormCurrentStep: {
            type: Number,
            enum: EAdultFormSteps,
        },
        autobiography: {
            text: String,
            videoUrl: String,
        },
    },
    {
        timestamps: true,
    }
);
