import { object, string, date, z, TypeOf } from "zod";

export const updateResearcherDTO = object({
    body: object({
        personal_data: object({
            full_name: string().trim(),
            phone: string().trim(),
            profile_photo: string(),
            birth_date: date({
                invalid_type_error: "That's not a date!",
            }),
            country_state: string().trim(),
        }),
        email: string().email("Email is invalid!").toLowerCase().trim(),
        password: string().min(
            8,
            "Password too short - should be 8 chars minimium"
        ),
        password_confirmation: string(),
        instituition: string().trim(),
    }).refine((data) => {
        if (data.password) {
            return data.password === data.password_confirmation;
        }
        return true;
    }, "Passwords don't match"),
});

export type UpdateResearcherDTO = z.infer<typeof updateResearcherDTO>;
