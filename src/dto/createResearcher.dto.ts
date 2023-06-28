import { object, string, date, z, TypeOf } from "zod";

export const createResearcherDTO = object({
    body: object({
        personal_data: object({
            full_name: string({
                required_error: "Full name is required",
            }).trim(),
            phone: string({
                required_error: "Phone number is required",
            }).trim(),
            profile_photo: string(),
            birth_date: date({
                required_error: "Birth date is required",
                invalid_type_error: "That's not a date!",
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
    }).refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
    }),
});

export type CreateResearcherDTO = z.infer<typeof createResearcherDTO>;
