import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import { register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", validateRequest(registerSchema), asyncHandler(register));

export default router;