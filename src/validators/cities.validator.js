import { z } from "zod";

export const citiesSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z
        .object({
            name: z.string().trim().min(1).optional()
        })
        .optional()
});
