
import { z } from "zod";

export const signupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(50, "Name cannot exceed 50 characters."),

    email: z
        .string()
        .trim()
        .min(1, "Email address is required.")
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .regex(/[A-Z]/, "Include at least one uppercase letter.")
        .regex(/[a-z]/, "Include at least one lowercase letter.")
        .regex(/[0-9]/, "Include at least one number."),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
