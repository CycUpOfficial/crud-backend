import { listUserChats, getChatMessages } from "../services/chat.service.js";
import { toChatListResponseDto, toChatMessagesResponseDto } from "../dtos/chat.dto.js";

export const listChats = async (req, res) => {
    const { page, limit } = req.validated?.query ?? {};
    const result = await listUserChats({
        userId: req.auth.userId,
        page,
        limit
    });

    res.status(200).json(toChatListResponseDto(result, req));
};

export const listChatMessages = async (req, res) => {
    const { chatId } = req.validated?.params ?? {};
    const { limit, before } = req.validated?.query ?? {};

    const result = await getChatMessages({
        userId: req.auth.userId,
        chatId,
        limit,
        before
    });

    res.status(200).json(toChatMessagesResponseDto(result, req));
};
