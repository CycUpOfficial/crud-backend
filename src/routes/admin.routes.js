import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { adminUsersSchema } from "../validators/admin.validator.js";
import { adminBlockUserSchema } from "../validators/admin.validator.js";
import { adminUnblockUserSchema } from "../validators/admin.validator.js";
import { adminCreateReportSchema } from "../validators/admin.validator.js";
import {
    getAdminAnalyticsController,
    getAdminUsersController,
    getAdminReports,
    disableAdminItemController,
    removeAdminItemController,
    blockAdminUserController,
    unblockAdminUserController,
    submitAdminReportController
} from "../controllers/admin.controller.js";

const router = Router();

router.post(
    "/items/:itemId/disable",
    requireAdmin,
    asyncHandler(disableAdminItemController)
);

router.delete(
    "/items/:itemId/remove",
    requireAdmin,
    asyncHandler(removeAdminItemController)
);

router.get(
    "/admin/analytics",
    requireAdmin,
    asyncHandler(getAdminAnalyticsController)
);

router.get(
    "/admin/users",
    requireAdmin,
    validateRequest(adminUsersSchema),
    asyncHandler(getAdminUsersController)
);

router.get("/admin/reports", requireAdmin, asyncHandler(getAdminReports));

router.post(
    "/admin/users/:userId/block",
    requireAdmin,
    validateRequest(adminBlockUserSchema),
    asyncHandler(blockAdminUserController)
);

router.post(
    "/admin/users/:userId/unblock",
    requireAdmin,
    validateRequest(adminUnblockUserSchema),
    asyncHandler(unblockAdminUserController)
);

router.post(
    "/admin/reports",
    requireAdmin,
    validateRequest(adminCreateReportSchema),
    asyncHandler(submitAdminReportController)
);


export default router;





