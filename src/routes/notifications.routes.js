import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { getNotificationsSchema, markNotificationReadSchema, markAllNotificationsReadSchema } from "../validators/notifications.validator.js";
import { getNotificationsController, markNotificationReadController, markAllNotificationsReadController } from "../controllers/notifications.controller.js";
import { readLimiter, writeLimiter } from "../middlewares/throttle.middleware.js";


const router = Router();

router.get(
    "/notifications", readLimiter,
    validateRequest(getNotificationsSchema),
    asyncHandler(getNotificationsController)
);

router.put(
    "/notifications/:notificationId/read", writeLimiter,
    validateRequest(markNotificationReadSchema),
    asyncHandler(markNotificationReadController)
);

router.put(
    "/notifications/read-all", writeLimiter,
    validateRequest(markAllNotificationsReadSchema),
    asyncHandler(markAllNotificationsReadController)
);

export default router;