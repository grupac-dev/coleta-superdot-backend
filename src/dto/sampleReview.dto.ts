import { number, object, string, z } from "zod";
import { SAMPLE_STATUS_ARRAY } from "../util/consts";

const createSampleReviewBody = object({
    sample_id: string({
        required_error: "Sample id to review is required.",
    }),
    next_status: z.enum(SAMPLE_STATUS_ARRAY, {
        required_error: "Next status is required",
    }),
    qtt_participants_authorized: number().optional(),
    review_message: string({
        required_error: "The review message is required!",
    }),
}).strict("A unknown key was found.");

export const createSampleReviewDTO = object({
    body: createSampleReviewBody,
});

const findReviewsBySampleParams = object({
    sampleId: string({
        required_error: "Sample id is required.",
    }),
}).strict();

export const findReviewsBySamplesDTO = object({
    params: findReviewsBySampleParams,
});

export type CreateSampleReviewDTO = z.infer<typeof createSampleReviewDTO>;
export type FindReviewsBySampleDTO = z.infer<typeof findReviewsBySamplesDTO>;
