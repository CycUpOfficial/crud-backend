import { z } from "zod";

export const listChatsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20)
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional()
});

export const listChatMessagesSchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        before: z.string().datetime().optional()
    }),
    params: z.object({
        chatId: z.string().min(1, "chatId is required.")
    }),
    body: z.object({}).optional()
});
