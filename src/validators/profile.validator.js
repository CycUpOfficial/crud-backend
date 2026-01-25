import { z } from "zod";

export const getProfileSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, "First name is required."),
        familyName: z.string().min(1, "Family name is required."),
        address: z.string().min(1, "Address is required."),
        postalCode: z.string().min(1, "Postal code is required."),
        city: z.string().min(1, "City is required."),
        phoneNumber: z
            .string()
            .regex(/^\+[1-9]\d{7,14}$/, "Phone number must be in international E.164 format (e.g., +491234567890).")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});
