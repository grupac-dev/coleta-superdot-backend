import { object, string, z } from "zod";

export const verifyValidationCodeSchema = object({
    body: object({
        participantEmail: string({
            required_error: "Participant email is required!",
        }),
        verificationCode: string({
            required_error: "Verification code is required!",
        }),
    }),
    params: object({
        sampleId: string({
            required_error: "Sample id param is required!",
        }),
    }),
});

export type VerifyValidationCodeDTO = z.infer<typeof verifyValidationCodeSchema>;
