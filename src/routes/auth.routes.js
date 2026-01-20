import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { registerSchema, verifySchema } from "../validators/auth.validator.js";
import { register, verify } from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", validateRequest(registerSchema), asyncHandler(register));
router.post("/auth/verify", validateRequest(verifySchema), asyncHandler(verify));

export default router;