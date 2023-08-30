import { Schema } from "mongoose";
import { RELATIONSHIPS_ARRAY } from "../../util/consts";
import { ISecondSource } from "../../interface/secondSource.interface";

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
                unique: true,
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
            job: String,
            occupation: String,
            phone: String,
            educationLevel: String,
        },
        teacherSubject: String,
    },
    {
        timestamps: true,
    }
);
