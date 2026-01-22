import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email("Invalid email format. Please provide a valid email address.")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const verifySchema = z.object({
    body: z
        .object({
            email: z
                .string()
                .email("Invalid email address."),
            pinCode: z
                .string()
                .min(1, "Invalid PIN code. Please check your email and try again."),
            password: z
                .string()
                .min(8, "Password must be at least 8 characters long."),
            passwordConfirmation: z
                .string()
                .min(8, "Password must be at least 8 characters long.")
        })
        .refine((data) => data.password === data.passwordConfirmation, {
            message: "Passwords do not match. Please ensure both password fields are identical.",
            path: ["passwordConfirmation"]
        }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email("Invalid email address."),
        password: z
            .string()
            .min(1, "Invalid email or password. Please check your credentials and try again.")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const logoutSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const requestPasswordResetSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email("Invalid email address.")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});