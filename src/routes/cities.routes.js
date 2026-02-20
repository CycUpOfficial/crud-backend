import { Router } from "express";
import { getCities } from "../controllers/cities.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { citiesSchema } from "../validators/cities.validator.js";
import { readLimiter } from "../middlewares/throttle.middleware.js";

const router = Router();

router.get("/cities", readLimiter, validateRequest(citiesSchema), asyncHandler(getCities));

export default router;