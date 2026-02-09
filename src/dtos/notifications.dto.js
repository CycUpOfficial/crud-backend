export const toNotificationDto = (n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.isRead,
    createdAt: n.createdAt,
    metadata: n.metadata ?? {}
});

export const toNotificationsResponseDto = ({ notifications, pagination }) => ({
    message: "Notification retrieved successfully!",
    notifications: notifications.map(toNotificationDto),
    pagination
});
