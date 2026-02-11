import { Chat } from "../models/chat.model.js";
import { ChatMessage } from "../models/message.model.js";

export const findChatById = async (chatId) =>
    Chat.findById(chatId).lean();

export const findChatByItemAndParticipants = async ({ itemId, participantKey }) =>
    Chat.findOne({ itemId, participantKey }).lean();

export const createChat = async (data) =>
    Chat.create(data);

export const listChatsForUser = async ({ userId, skip, take }) =>
    Chat.find({ participants: userId })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(take)
        .lean();

export const countChatsForUser = async (userId) =>
    Chat.countDocuments({ participants: userId });

export const listMessagesForChat = async ({ chatId, before, limit }) => {
    const where = { chatId };
    if (before) {
        where.createdAt = { $lt: before };
    }

    return ChatMessage.find(where)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

export const createMessage = async (data) =>
    ChatMessage.create(data);

export const updateChatLastMessage = async ({ chatId, lastMessageAt, lastMessagePreview }) =>
    Chat.findByIdAndUpdate(chatId, { lastMessageAt, lastMessagePreview }, { new: true }).lean();
