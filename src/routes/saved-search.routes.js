import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createSavedSearchSchema } from "../validators/saved-search.validator.js";
import { createSavedSearchController } from "../controllers/saved-search.controller.js";
import { getSavedSearchesController } from "../controllers/saved-search.controller.js";
import { updateSavedSearchController, deleteSavedSearchController } from "../controllers/saved-search.controller.js";
import { updateSavedSearchSchema, deleteSavedSearchSchema } from "../validators/saved-search.validator.js";
import { writeLimiter, readLimiter } from "../middlewares/throttle.middleware.js";


const router = Router();

router.post(
    "/saved_search", writeLimiter,
    validateRequest(createSavedSearchSchema),
    asyncHandler(createSavedSearchController)
);

router.get(
    "/saved-search", readLimiter,
    asyncHandler(getSavedSearchesController)
);

router.put(
    "/saved-search/:searchId", writeLimiter,
    validateRequest(updateSavedSearchSchema),
    asyncHandler(updateSavedSearchController)
);

router.delete(
    "/saved-search/:searchId", writeLimiter,
    validateRequest(deleteSavedSearchSchema),
    asyncHandler(deleteSavedSearchController)
);


export default router;