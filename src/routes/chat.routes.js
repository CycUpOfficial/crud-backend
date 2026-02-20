import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { listChats, listChatMessages } from "../controllers/chat.controller.js";
import { listChatsSchema, listChatMessagesSchema } from "../validators/chat.validator.js";

const router = Router();

router.get("/chats", validateRequest(listChatsSchema), asyncHandler(listChats));
router.get(
    "/chats/:chatId/messages",
    validateRequest(listChatMessagesSchema),
    asyncHandler(listChatMessages)
);

export default router;
