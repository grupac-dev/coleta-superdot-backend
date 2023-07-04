import { object, string, z } from "zod";

export const loginDTO = object({
    body: object({
        email: string({
            required_error: "Email is required!",
        }).email("Email is invalid!"),
        password: string({
            required_error: "Password is required",
        }).min(8, "Password too short - should be 8 chars minimium"),
    }),
});

export type LoginDTO = z.infer<typeof loginDTO>;
