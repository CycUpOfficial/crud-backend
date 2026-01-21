import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { registerSchema, verifySchema, loginSchema } from "../validators/auth.validator.js";
import { register, verify, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", validateRequest(registerSchema), asyncHandler(register));
router.post("/auth/verify", validateRequest(verifySchema), asyncHandler(verify));
router.post("/auth/login", validateRequest(loginSchema), asyncHandler(login));

export default router;