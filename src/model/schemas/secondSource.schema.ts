import { Schema } from "mongoose";
import { EAdultFormGroup, EAdultFormSteps, RELATIONSHIPS_ARRAY, RELATIONSHIP_TIME_ARRAY } from "../../util/consts";
import { ISecondSource } from "../../interface/secondSource.interface";
import { questionSchema } from "../adultForm/schemas/question.schema";

export const secondSourceSchema = new Schema<ISecondSource>(
    {
        personalData: {
            fullName: {
                type: String,
                uppercase: true,
                trim: true,
                required: [true, "Second source name is required!"],
            },
            email: {
                type: String,
                match: [
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    "E-mail should be valid",
                ],
                trim: true,
                lowercase: true,
                required: [true, "Second source is required!"],
            },
            birthDate: Date,
            relationship: {
                type: String,
                enum: RELATIONSHIPS_ARRAY,
                required: [true, "Second source relationship is required!"],
            },
            relationshipTime: {
                type: String,
                enum: RELATIONSHIP_TIME_ARRAY,
            },
            job: String,
            occupation: String,
            street: String,
            district: String,
            countryCity: String,
            phone: String,
            educationLevel: String,
        },
        acceptTaleIn: Date,
        acceptTcleIn: Date,
        teacherSubject: String,
        indicated: Boolean,
        startFillFormDate: Date,
        endFillFormDate: Date,
        adultFormCurrentStep: {
            type: Number,
            enum: EAdultFormSteps,
        },
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
    },
    {
        timestamps: true,
    }
);
