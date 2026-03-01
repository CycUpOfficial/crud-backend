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
import { readLimiter, writeLimiter } from "../middlewares/throttle.middleware.js";

const router = Router();

router.post("/items", writeLimiter, asyncHandler(createItem));
router.get("/items", readLimiter, validateRequest(listItemsSchema), asyncHandler(listItems));
router.get("/items/:itemId", readLimiter, validateRequest(itemIdSchema), asyncHandler(getItemById));
router.put("/items/:itemId", writeLimiter, asyncHandler(updateItem));
router.delete("/items/:itemId", writeLimiter, validateRequest(itemIdSchema), asyncHandler(deleteItem));
router.post("/items/:itemId/mark-sold", writeLimiter, validateRequest(markItemSoldSchema), asyncHandler(markItemAsSold));

export default router;