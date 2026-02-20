import { Router } from "express";
import { getCategories } from "../controllers/categories.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { categoriesSchema } from "../validators/categories.validator.js";
import { readLimiter } from "../middlewares/throttle.middleware.js";

const router = Router();

router.get("/categories", readLimiter, validateRequest(categoriesSchema), asyncHandler(getCategories));

export default router;