import { Router } from "express";
import { healthCheck } from "../controllers/health.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { healthSchema } from "../validators/health.validator.js";

const router = Router();

router.get("/health", validateRequest(healthSchema), asyncHandler(healthCheck));

export default router;