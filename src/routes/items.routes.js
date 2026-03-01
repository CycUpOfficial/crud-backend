import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
	createItem,
	listItems,
	getItemById,
	updateItem,
	deleteItem,
	markItemAsSold
} from "../controllers/items.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { itemIdSchema, listItemsSchema, markItemSoldSchema } from "../validators/items.validator.js";

const router = Router();

router.post("/items", asyncHandler(createItem));
router.get("/items", validateRequest(listItemsSchema), asyncHandler(listItems));
router.get("/items/:itemId", validateRequest(itemIdSchema), asyncHandler(getItemById));
router.put("/items/:itemId", asyncHandler(updateItem));
router.delete("/items/:itemId", validateRequest(itemIdSchema), asyncHandler(deleteItem));
router.post("/items/:itemId/mark-sold", validateRequest(markItemSoldSchema), asyncHandler(markItemAsSold));

export default router;
