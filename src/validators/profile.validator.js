import {z} from "zod";

export const getProfileSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const updateProfileSchema = z.object({
    body: z.object({
        username: z
            .string({
                error: issue => issue.input === undefined ? "Username is Required" : "This field must be a string"
            })
            .min(3, "Username must be at least 3 characters long.")
            .max(30, "Username must be at most 30 characters long.")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
        firstName: z
            .string({
                error: issue => issue.input === undefined ? "First Name is Required" : "This field must be a string"
            }),
        familyName: z
            .string({
                error: issue => issue.input === undefined ? "Family Name is Required" : "This field must be a string"
            }),
        address: z
            .string({
                error: issue => issue.input === undefined ? "Address is Required" : "This field must be a string"
            }),
        postalCode: z
            .string({
                error: issue => issue.input === undefined ? "Postal code is Required" : "This field must be a string"
            }),
        city: z
            .string({
                error: issue => issue.input === undefined ? "City Name is Required" : "This field must be a string"
            }),
        phoneNumber: z
            .string(
                {
                    error: issue => issue.input === undefined ? "Phone Number is Required" : "This field must be a string"
                })
            .regex(/^\+[1-9]\d{7,14}$/, "Phone number must be in international E.164 format (e.g., +491234567890).")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});
