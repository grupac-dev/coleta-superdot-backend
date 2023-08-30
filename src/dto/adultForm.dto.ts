import { array, number, object, string, z } from "zod";
import {
    DEVICES_ARRAY,
    EDUCATION_LEVEL_ARRAY,
    GENDER_ARRAY,
    INCOME_LEVELS_ARRAY,
    MARITAL_STATUS_ARRAY,
    RELATIONSHIPS_ARRAY,
} from "../util/consts";
import { DateTime } from "luxon";
import validator from "validator";

export const adultFormParticipantDataBody = object({
    personalData: object({
        fullName: string({
            required_error: "Full name is required",
        }).trim(),
        phone: string({ required_error: "Phone is required" }),
        email: string({ required_error: "Full name is required" }).email({ message: "Email invalid" }),
        maritalStatus: z.enum(MARITAL_STATUS_ARRAY, { required_error: "The marital status is required" }),
        job: string({ required_error: "Job is required" }),
        occupation: string({ required_error: "Occupation is required" }),
        educationLevel: z.enum(EDUCATION_LEVEL_ARRAY, { required_error: "Education level is required" }),
        gender: z.enum(GENDER_ARRAY, { required_error: "Gender is required" }),
        birthDate: string({
            required_error: "Birth date is required",
        }).transform((val, ctx) => {
            if (!validator.isISO8601(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid date!",
                });
            }

            return DateTime.fromISO(val).toJSDate();
        }),
    }),
    familyData: object({
        qttChildrens: number({ required_error: "Childrens quantity is required" }),
        qttSiblings: number({ required_error: "Siblings quantity is required" }),
        qttFamilyMembers: string({ required_error: "Family members quantity is required" }),
        familyMonthIncome: z.enum(INCOME_LEVELS_ARRAY, { required_error: "The income level is required" }),
        houseDevices: array(z.enum(DEVICES_ARRAY)).optional(),
        outsideHouseDevices: array(z.enum(DEVICES_ARRAY)).optional(),
    }),
    addressData: object({
        city: string({ required_error: "City is required" }),
        district: string({ required_error: "District is required" }),
        street: string({ required_error: "Street is required" }),
        houseNumber: string({ required_error: "House number is required" }),
    }),
});

const adultFormParticipantDataParams = object({
    sampleId: string(),
});

export const adultFormParticipantDataDTO = object({
    body: adultFormParticipantDataBody,
    params: adultFormParticipantDataParams,
});

export type AdultFormParticipantDataDTO = z.infer<typeof adultFormParticipantDataDTO>;

/*** TO ACCEPT DOCS */

const adultFormAcceptDocsParams = object({
    sampleId: string({ required_error: "Sample id param is required!" }),
});

export const adultFormAcceptDocsDTO = object({
    params: adultFormAcceptDocsParams,
});

export type AdultFormAcceptDocsDTO = z.infer<typeof adultFormAcceptDocsDTO>;

/** INDICATE SECOND SOURCE */
const adultFormIndicateSecondSourceBody = object({
    secondSources: array(
        object({
            relationship: z.enum(RELATIONSHIPS_ARRAY, { required_error: "Invalid relationship!" }),
            fullName: string({ required_error: "Second source name is required." }),
            email: string({ required_error: "Second source email is required." }).email("Invalid e-mail."),
            teacherSubject: string().optional(),
        }),
        { required_error: "Second source array is required!" }
    ),
});

const adultFormIndicateSecondSourceParams = object({
    sampleId: string({ required_error: "Sample id param is required!" }),
});

export const adultFormIndicateSecondSourceDTO = object({
    body: adultFormIndicateSecondSourceBody,
    params: adultFormIndicateSecondSourceParams,
});

export type AdultFormIndicateSecondSourceDTO = z.infer<typeof adultFormIndicateSecondSourceDTO>;
