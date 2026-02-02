import { z } from "zod";

export const createRatingSchema = z.object({
    body: z.object({
        rating: z
            .number()
            .int("Rating must be between 1 and 5.")
            .min(1, "Rating must be between 1 and 5.")
            .max(5, "Rating must be between 1 and 5."),
        comment: z.string().max(1000, "Comment is too long.").optional()
    }),
    params: z.object({
        itemId: z.string().min(1, "Item ID not found!")
    }),
    query: z.object({}).optional()
});
