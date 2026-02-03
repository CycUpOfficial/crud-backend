import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { createItem, listItems } from "../controllers/items.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { listItemsSchema } from "../validators/items.validator.js";

const router = Router();

router.post("/items", asyncHandler(createItem));
router.get("/items", validateRequest(listItemsSchema), asyncHandler(listItems));

export default router;
