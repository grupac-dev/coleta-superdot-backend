import { number, object, string, z } from "zod";

const createSampleBody = object({
    research_title: string({
        required_error: "Research title is required!",
    }).trim(),
    sample_title: string({
        required_error: "Sample title is required!",
    }),
    sample_group: string({
        required_error: "Sample group is required!",
    }),
    qtt_participants_requested: string({
        required_error: "Is necessary to inform the sample partcipants quantity requested.",
    }).transform((val) => Number(val)),
    research_cep: object({
        cep_code: string({
            required_error: "CEP code is required.",
        }),
    }),
    country_region: string({
        required_error: "Sample country region is required.",
    }),
    country_state: string({
        required_error: "Sample country state is required.",
    }),
    country_city: string({
        required_error: "Sample country city is required.",
    }),
    instituition: object({
        name: string({
            required_error: "Sample instituition name is required.",
        }),
        type: z.enum(["Pública", "Particular"], {
            required_error: "Sample instituition type is required.",
        }),
    }),
}).strict("A unknown key was found.");

export const paginateSampleParams = object({
    currentPage: string(),
    itemsPerPage: string().optional(),
}).strict("A unknown param was found.");

export const createSampleDTO = object({
    body: createSampleBody,
});

export const paginateSampleDTO = object({
    params: paginateSampleParams,
});

export type CreateSampleDTO = z.infer<typeof createSampleDTO>;
export type PaginateSampleDTO = z.infer<typeof paginateSampleDTO>;
