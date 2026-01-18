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