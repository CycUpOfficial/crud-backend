import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { registerSchema, verifySchema, loginSchema, logoutSchema, requestPasswordResetSchema, confirmPasswordResetSchema } from "../validators/auth.validator.js";
import { register, verify, login, logout, requestPasswordResetController, confirmPasswordResetController, me } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/throttle.middleware.js";

const router = Router();

router.post("/auth/register", authLimiter, validateRequest(registerSchema), asyncHandler(register));
router.post("/auth/verify", authLimiter, validateRequest(verifySchema), asyncHandler(verify));
router.post("/auth/login", authLimiter, validateRequest(loginSchema), asyncHandler(login));
router.post("/auth/logout", validateRequest(logoutSchema), asyncHandler(logout));
router.post("/auth/password/reset", authLimiter, validateRequest(requestPasswordResetSchema), asyncHandler(requestPasswordResetController));
router.post("/auth/password/reset/confirm", authLimiter, validateRequest(confirmPasswordResetSchema), asyncHandler(confirmPasswordResetController));
router.get("/auth/me", asyncHandler(me));

export default router;