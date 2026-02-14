import { getItemForChat } from "../repositories/items.repository.js";
import { getUserById } from "../repositories/auth.repository.js";
import {
    countChatsForUser,
    createChat,
    createMessage,
    findChatById,
    findChatByItemAndParticipants,
    listChatsForUser,
    listMessagesForChat,
    updateChatLastMessage
} from "../repositories/chat.repository.js";
import { saveFile } from "../storage/storage.service.js";

const CHAT_FILE_MAX_SIZE = 5 * 1024 * 1024;

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));

const buildParticipantKey = (userId, otherUserId) =>
    [userId, otherUserId].sort().join(":");

const buildItemSnapshot = (item) => ({
    id: item.id,
    title: item.title,
    itemType: item.itemType,
    sellingPrice: toNumberOrNull(item.sellingPrice),
    lendingPrice: toNumberOrNull(item.lendingPrice),
    rentUnit: item.rentUnit ?? null,
    city: item.city?.name ?? null,
    mainImage: item.photos?.[0]?.photoUrl ?? null,
    ownerId: item.ownerId
});

const failIfChatNotFound = () => {
    const error = new Error("Not found.");
    error.statusCode = 404;
    throw error;
};

const failIfNotParticipant = () => {
    const error = new Error("Not authorized to take this action.");
    error.statusCode = 403;
    throw error;
};

const failIfInvalidFile = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
};

export const startChat = async ({ userId, itemId, otherUserId }) => {
    if (!otherUserId || otherUserId === userId) {
        failIfNotParticipant();
    }

    const [item, otherUser] = await Promise.all([
        getItemForChat(itemId),
        getUserById(otherUserId)
    ]);

    if (!item || item.status !== "published" || item.isDisabledByAdmin) {
        const error = new Error("Not found.");
        error.statusCode = 404;
        throw error;
    }

    if (!otherUser) {
        const error = new Error("Not found.");
        error.statusCode = 404;
        throw error;
    }

    const participants = [userId, otherUserId];
    if (!participants.includes(item.ownerId)) {
        failIfNotParticipant();
    }

    const participantKey = buildParticipantKey(userId, otherUserId);
    const existing = await findChatByItemAndParticipants({ itemId, participantKey });
    if (existing) return existing;

    const chat = await createChat({
        itemId,
        participants,
        participantKey,
        itemSnapshot: buildItemSnapshot(item)
    });

    return chat.toObject();
};

export const listUserChats = async ({ userId, page = 1, limit = 20 }) => {
    const safeLimit = Math.min(limit, 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const [chats, total] = await Promise.all([
        listChatsForUser({ userId, skip, take: safeLimit }),
        countChatsForUser(userId)
    ]);

    return {
        chats,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: total ? Math.ceil(total / safeLimit) : 0
        }
    };
};

export const getChatMessages = async ({ userId, chatId, limit = 50, before }) => {
    const chat = await findChatById(chatId);
    if (!chat) failIfChatNotFound();
    if (!chat.participants?.includes(userId)) failIfNotParticipant();

    const safeLimit = Math.min(limit, 100);
    const beforeDate = before ? new Date(before) : null;

    const messages = await listMessagesForChat({
        chatId,
        before: beforeDate,
        limit: safeLimit
    });

    const sorted = [...messages].reverse();
    const nextCursor = messages.length ? messages[messages.length - 1].createdAt : null;

    return {
        messages: sorted,
        nextCursor
    };
};

const toBufferFromPayload = (data) => {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) {
        return Buffer.from(data);
    }
    if (ArrayBuffer.isView(data)) {
        return Buffer.from(data.buffer);
    }
    if (typeof data === "string") {
        return Buffer.from(data, "base64");
    }
    return null;
};

export const sendChatMessage = async ({ userId, chatId, text, file }) => {
    const chat = await findChatById(chatId);
    if (!chat) failIfChatNotFound();
    if (!chat.participants?.includes(userId)) failIfNotParticipant();

    const trimmedText = text?.trim() ?? null;
    if (!trimmedText && !file) {
        const error = new Error("Message text or file is required.");
        error.statusCode = 400;
        throw error;
    }

    let filePayload = null;
    if (file) {
        const buffer = toBufferFromPayload(file.data);
        if (!buffer) {
            failIfInvalidFile("Invalid file data.");
        }

        if (buffer.length > CHAT_FILE_MAX_SIZE) {
            failIfInvalidFile("File is too large. Maximum size is 5 MB.");
        }

        const fileName = file.name || "file";
        const mimeType = file.mimeType || "application/octet-stream";

        const saved = await saveFile({
            file: {
                originalname: fileName,
                buffer
            },
            folder: "chat-files"
        });

        filePayload = {
            url: saved.url,
            name: fileName,
            size: buffer.length,
            mimeType
        };
    }

    const message = await createMessage({
        chatId,
        senderId: userId,
        text: trimmedText,
        file: filePayload
    });

    const preview = trimmedText || filePayload?.name || "Attachment";
    await updateChatLastMessage({
        chatId,
        lastMessageAt: message.createdAt,
        lastMessagePreview: preview
    });

    return message.toObject();
};
