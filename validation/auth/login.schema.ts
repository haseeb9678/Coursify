import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Email address is required.")
        .email("Please enter a valid email address.")
        .max(255, "Email cannot exceed 255 characters."),

    password: z
        .string()
        .min(1, "Password is required.")
        .max(128, "Password cannot exceed 128 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;