import { z } from "zod";

export const dashboardItemsQuerySchema = z.object({
    query: z.object({
        status: z
            .enum(["published", "deleted", "expired", "sold"])
            .optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20)
    })
});
