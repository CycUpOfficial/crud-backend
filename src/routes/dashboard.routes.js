import express from "express";
import {
    dashboardAnalytics,
    dashboardItems,
    dashboardRatings
} from "../controllers/dashboard.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { dashboardItemsQuerySchema } from "../validators/dashboard.validator.js";

const router = express.Router();

router.get("/dashboard/analytics", dashboardAnalytics);

router.get(
    "/dashboard/items",
    validateRequest(dashboardItemsQuerySchema),
    dashboardItems
);

router.get("/dashboard/ratings", dashboardRatings);

export default router;


