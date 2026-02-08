import { z } from "zod";

export const createSavedSearchSchema = z.object({
    body: z.object({
        searchTerms: z
            .array(z.string().min(1, "Invalid input!"))
            .min(1, "Invalid input!")
            .max(1, "Only one keyword allowed at a time."),
        email: z.boolean().optional().default(false),
        in_app: z.boolean().optional().default(false)
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const updateSavedSearchSchema = z.object({
    params: z.object({
        searchId: z.string().min(1, "Invalid input!")
    }),
    body: z.object({
        // Optional: allow editing keyword (one at a time)
        searchTerms: z
            .array(z.string().min(1, "Invalid input!"))
            .min(1, "Invalid input!")
            .max(1, "Only one keyword allowed at a time.")
            .optional(),

        // Optional: allow toggling notifications
        email: z.boolean().optional(),
        in_app: z.boolean().optional()
    }).refine((data) => {
        // Must provide at least one field to update
        return (
            data.searchTerms !== undefined ||
            data.email !== undefined ||
            data.in_app !== undefined
        );
    }, { message: "Invalid input!" }),
    query: z.object({}).optional()
});

export const deleteSavedSearchSchema = z.object({
    params: z.object({
        searchId: z.string().min(1, "Invalid input!")
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional()
});
