import { z } from "zod";

export const adminUsersSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20)
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional()
});

export const adminBlockUserSchema = z.object({
    body: z.object({
        reason: z
            .string()
            .min(1, "Reason is required.")
            .max(500, "Reason is too long.")
    }),
    params: z.object({
        userId: z.string().min(1, "userId is required.")
    }),
    query: z.object({}).optional()
});

export const adminUnblockUserSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        userId: z.string().min(1, "userId is required.")
    }),
    query: z.object({}).optional()
});

export const adminCreateReportSchema = z.object({
    body: z.object({
        userId: z.string().min(1, "userId is required."),
        description: z.string().min(1, "Description is required.").max(2000, "Description is too long.")
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});