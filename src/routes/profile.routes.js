import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";
import { getProfileSchema, updateProfileSchema } from "../validators/profile.validator.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/users/profile", validateRequest(getProfileSchema), asyncHandler(getProfile));
router.put(
    "/users/profile",
    uploadProfileImage,
    validateRequest(updateProfileSchema),
    asyncHandler(updateProfile)
);

export default router;
