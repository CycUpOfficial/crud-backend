import { z } from "zod";

export const getNotificationsSchema = z.object({
    query: z.object({
        unreadOnly: z
            .string()
            .optional()
            .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
            .default(false),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20)
    }).optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional()
});

export const markNotificationReadSchema = z.object({
    params: z.object({
        notificationId: z.string().min(1, "Notification not found!")
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional()
});
