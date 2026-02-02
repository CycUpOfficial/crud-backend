import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { createItem } from "../controllers/items.controller.js";

const router = Router();

router.post("/items", asyncHandler(createItem));

export default router;
