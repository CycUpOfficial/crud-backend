import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { getProfileSchema } from "../validators/profile.validator.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/users/profile", validateRequest(getProfileSchema), asyncHandler(getProfile));
router.put(
    "/users/profile",
    asyncHandler(updateProfile)
);

export default router;
