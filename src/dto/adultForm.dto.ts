import { array, number, object, string, union, z } from "zod";
import { EAdultFormGroup, EQuestionType } from "../util/consts";
import mongoose from "mongoose";

/** GET QUESTIONS BY GROUP */
export const adultFormAllQuestionsByGroupDTO = object({
    params: object({
        formSource: string({ required_error: "Group source is required!" }).transform((val, ctx) => {
            if (Number.isNaN(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Form source is not a number.",
                });
            }

            return Number(val);
        }),
        groupSequence: string({ required_error: "Group sequence param is required!" }).transform((val, ctx) => {
            if (Number.isNaN(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,

                    message: "Group sequence is not a number.",
                });
            }

            if (!Object.values(EAdultFormGroup).includes(Number(val))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Group sequence invalid.",
                });
            }

            return Number(val);
        }),
    }),
});

export type AdultFormAllQuestionsByGroupDTO = z.infer<typeof adultFormAllQuestionsByGroupDTO>;

/** SUBMIT QUESTIONS */
export const adultFormSubmitQuestionsByGroupDTO = object({
    body: object({
        groupName: string({ required_error: "Group name is required!" }),
        sequence: number({ required_error: "Group sequence is required!" }),
        questions: array(
            object({
                _id: string({ required_error: "Question id is required!" }),
                sequence: number({ required_error: "Question sequence is required!" }),
                statement: string({ required_error: "Question statement is required!" }),
                questionType: number({ required_error: "Question type is required!" }).transform((val, ctx) => {
                    if (!Object.values(EQuestionType).includes(Number(val))) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Question type is invalid.",
                        });
                    }

                    return val;
                }),
                options: array(string()).optional(),
                answer: union([array(string()), string()]).optional(),
            }).transform((question, ctx) => {
                if (Array.isArray(question.answer)) {
                    if (question.questionType !== EQuestionType.MULTIPLE_SELECT && question.answer.length !== 4) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "A multiple response answer needs to have an exact 4 answers.",
                        });
                    }
                }

                return question;
            })
        ),
    }),
    params: object({
        sampleId: string({ required_error: "Sample id param is required!" }).transform((val, ctx) => {
            if (!mongoose.Types.ObjectId.isValid(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Sample id param is a invalid ID.",
                });
            }

            return val;
        }),
        participantId: string().optional(),
    }),
});

export type AdultFormSubmitQuestionsByGroupDTO = z.infer<typeof adultFormSubmitQuestionsByGroupDTO>;
