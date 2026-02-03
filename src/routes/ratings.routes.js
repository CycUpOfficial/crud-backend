import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createRatingSchema } from "../validators/ratings.validator.js";
import { submitRatingController } from "../controllers/ratings.controller.js";

const router = Router({ mergeParams: true });

router.post("/", validateRequest(createRatingSchema), asyncHandler(submitRatingController));

export default router;
