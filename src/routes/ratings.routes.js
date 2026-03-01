import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createRatingSchema } from "../validators/ratings.validator.js";
import { submitRatingController } from "../controllers/ratings.controller.js";
import { writeLimiter } from "../middlewares/throttle.middleware.js";

const router = Router({ mergeParams: true });

router.post("/", writeLimiter, validateRequest(createRatingSchema), asyncHandler(submitRatingController));

export default router;