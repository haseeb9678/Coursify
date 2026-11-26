
import { z } from "zod";

const SIGNUP_PASSWORD_MIN_LENGTH = 8;
const SIGNUP_PASSWORD_UPPERCASE = /[A-Z]/;
const SIGNUP_PASSWORD_LOWERCASE = /[a-z]/;
const SIGNUP_PASSWORD_NUMBER = /[0-9]/;

export const signupPasswordRequirements = [
    {
        id: "minimum-length",
        label: `At least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`,
        isMet: (password: string) => password.length >= SIGNUP_PASSWORD_MIN_LENGTH,
    },
    {
        id: "uppercase",
        label: "One uppercase letter",
        isMet: (password: string) => SIGNUP_PASSWORD_UPPERCASE.test(password),
    },
    {
        id: "lowercase",
        label: "One lowercase letter",
        isMet: (password: string) => SIGNUP_PASSWORD_LOWERCASE.test(password),
    },
    {
        id: "number",
        label: "At least one number",
        isMet: (password: string) => SIGNUP_PASSWORD_NUMBER.test(password),
    },
] as const;

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
        .min(SIGNUP_PASSWORD_MIN_LENGTH, "Password must be at least 8 characters.")
        .regex(SIGNUP_PASSWORD_UPPERCASE, "Include at least one uppercase letter.")
        .regex(SIGNUP_PASSWORD_LOWERCASE, "Include at least one lowercase letter.")
        .regex(SIGNUP_PASSWORD_NUMBER, "Include at least one number."),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
