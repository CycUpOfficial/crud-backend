import { findNotificationsByUserId, markNotificationAsRead, markAllNotificationsAsRead } from "../repositories/notifications.repository.js";

export const getNotificationsService = async({ userId, unreadOnly, page, limit }) => {
    const { notifications, total } = await findNotificationsByUserId({
        userId,
        unreadOnly: Boolean(unreadOnly),
        page,
        limit
    });

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const markNotificationReadService = async({ userId, notificationId }) => {
    const result = await markNotificationAsRead({ userId, notificationId });

    if (!result || result.count === 0) {
        const error = new Error("Notification not found!");
        error.statusCode = 404;
        throw error;
    }
};

export const markAllNotificationsReadService = async({ userId }) => {
    const result = await markAllNotificationsAsRead({ userId });

    return {
        message: "All notifications marked as read!",
        count: result.count
    };
};