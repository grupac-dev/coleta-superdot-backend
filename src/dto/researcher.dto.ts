import { DateTime } from "luxon";
import validator from "validator";

import { object, string, z, optional, number } from "zod";

export const researcherBodyDTO = object({
    personal_data: object({
        full_name: string({
            required_error: "Full name is required",
        }).trim(),
        phone: string({
            required_error: "Phone number is required",
        }).trim(),
        profile_photo: optional(string()),
        birth_date: string({
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
        country_state: string({
            required_error: "Country state is required",
        }).trim(),
    }),
    email: string({
        required_error: "Email is required",
    })
        .email("Email is invalid!")
        .toLowerCase()
        .trim(),
    password: string({
        required_error: "Password is required",
    }).min(8, "Password too short - should be 8 chars minimium"),
    password_confirmation: string({
        required_error: "Password confirmation is required",
    }),
    instituition: string({
        required_error: "Instituition is required",
    }).trim(),
});

export const paginateResearcherParams = object({
    currentPage: string(),
    itemsPerPage: string().optional(),
});

export const paginateResearcherQuery = object({
    user_name: string().optional(),
    user_email: string().optional(),
});

export const paginateResearcherDTO = object({
    params: paginateResearcherParams,
    query: paginateResearcherQuery,
});

export const researcherDTO = object({
    body: researcherBodyDTO.refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    }),
});

export const updateResearcherDTO = object({
    body: researcherBodyDTO
        .extend({
            password: optional(string().min(8, "Password too short - should be 8 chars minimium")),
            password_confirmation: optional(string()),
        })
        .refine(
            (data) => {
                if (data.password) {
                    return data.password === data.password_confirmation;
                }
                return true;
            },
            {
                message: "Passwords do not match",
                path: ["password_confirmation"],
            }
        ),
});

export type ResearcherDTO = z.infer<typeof researcherDTO>;
export type UpdateResearcherDTO = z.infer<typeof updateResearcherDTO>;
export type PaginateResearcherDTO = z.infer<typeof paginateResearcherDTO>;
