import { getNotificationsService, markNotificationReadService } from "../services/notifications.service.js";
import { toNotificationsResponseDto } from "../dtos/notifications.dto.js";

export const getNotificationsController = async (req, res) => {
    const userId = req.auth.userId;

    const query = req.validated?.query ?? {};
    const unreadOnly = query.unreadOnly ?? false;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await getNotificationsService({ userId, unreadOnly, page, limit });

    res.status(200).json(
        toNotificationsResponseDto({
            notifications: result.notifications,
            pagination: result.pagination
        })
    );
};

export const markNotificationReadController = async (req, res) => {
    const userId = req.auth.userId;
    const { notificationId } = req.validated.params;

    await markNotificationReadService({ userId, notificationId });

    res.status(200).json({
        message: "Notification Mark as read!"
    });
};
