import { prisma } from "../db/index.js";

export const findNotificationsByUserId = async ({ userId, unreadOnly, page, limit }) => {
    const where = {
        userId,
        ...(unreadOnly ? { isRead: false } : {})
    };

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.notification.count({ where })
    ]);

    return { notifications, total };
};

export const markNotificationAsRead = async ({ userId, notificationId }) => {
    // updateMany lets us safely enforce ownership; returns count
    return prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true }
    });
};
