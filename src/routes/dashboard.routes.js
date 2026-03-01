import express from "express";
import {
    dashboardAnalytics,
    dashboardItems,
    dashboardRatings
} from "../controllers/dashboard.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { dashboardItemsQuerySchema } from "../validators/dashboard.validator.js";
import { readLimiter } from "../middlewares/throttle.middleware.js";


const router = express.Router();

router.get("/dashboard/analytics", readLimiter, dashboardAnalytics);

router.get(
    "/dashboard/items",
    validateRequest(dashboardItemsQuerySchema),
    readLimiter,
    dashboardItems
);

router.get("/dashboard/ratings", readLimiter, dashboardRatings);

export default router;