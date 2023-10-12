import { object, string, z } from "zod";

/** TO ACCEPT DOCS */

export const secondSourceAcceptAllSampleDocsDTO = object({
    params: object({
        sampleId: string({ required_error: "Sample id param is required!" }),
        participantId: string({
            required_error: "Participant id param is required!",
        }),
    }),
});

export type SecondSourceAcceptAllSampleDocsDTO = z.infer<typeof secondSourceAcceptAllSampleDocsDTO>;
