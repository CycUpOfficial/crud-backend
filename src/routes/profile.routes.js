import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
    getProfileSchema,
    updateNameSchema,
    updateAddressSchema,
    updatePhoneSchema,
    updateProfileImageSchema
} from "../validators/profile.validator.js";
import {
    getProfile,
    updateProfile,
    updateName,
    updateAddress,
    updatePhone,
    updateProfileImage
} from "../controllers/profile.controller.js";
import { readLimiter, writeLimiter } from "../middlewares/throttle.middleware.js";

const router = Router();

router.get("/users/profile", readLimiter, validateRequest(getProfileSchema), asyncHandler(getProfile));

// existing full update
router.put(
    "/users/profile",
    writeLimiter,
    asyncHandler(updateProfile)
);

// granular update endpoints
router.put(
    "/users/profile/name",
    writeLimiter,
    validateRequest(updateNameSchema),
    asyncHandler(updateName)
);

router.put(
    "/users/profile/address",
    writeLimiter,
    validateRequest(updateAddressSchema),
    asyncHandler(updateAddress)
);

router.put(
    "/users/profile/phone",
    writeLimiter,
    validateRequest(updatePhoneSchema),
    asyncHandler(updatePhone)
);

router.post(
    "/users/profile/image",
    writeLimiter,
    asyncHandler(updateProfileImage)
);

export default router;