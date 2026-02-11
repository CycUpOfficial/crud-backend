const buildFileUrl = (req, fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return fileUrl;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    if (fileUrl.startsWith("/")) {
        return `${baseUrl}${fileUrl}`;
    }
    return `${baseUrl}/${fileUrl}`;
};

export const toChatDto = (chat, req) => ({
    id: chat._id?.toString?.() ?? chat.id,
    item: chat.itemSnapshot
        ? {
            id: chat.itemSnapshot.id,
            title: chat.itemSnapshot.title,
            itemType: chat.itemSnapshot.itemType,
            sellingPrice: chat.itemSnapshot.sellingPrice,
            lendingPrice: chat.itemSnapshot.lendingPrice,
            rentUnit: chat.itemSnapshot.rentUnit,
            city: chat.itemSnapshot.city,
            mainImage: buildFileUrl(req, chat.itemSnapshot.mainImage),
            ownerId: chat.itemSnapshot.ownerId
        }
        : null,
    participants: chat.participants ?? [],
    lastMessageAt: chat.lastMessageAt ?? null,
    lastMessagePreview: chat.lastMessagePreview ?? null,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
});

export const toMessageDto = (message, req) => ({
    id: message._id?.toString?.() ?? message.id,
    chatId: message.chatId?.toString?.() ?? message.chatId,
    senderId: message.senderId,
    text: message.text,
    file: message.file
        ? {
            url: buildFileUrl(req, message.file.url),
            name: message.file.name,
            size: message.file.size,
            mimeType: message.file.mimeType
        }
        : null,
    createdAt: message.createdAt
});

export const toChatListResponseDto = ({ chats, pagination }, req) => ({
    chats: chats.map((chat) => toChatDto(chat, req)),
    pagination
});

export const toChatMessagesResponseDto = ({ messages, nextCursor }, req) => ({
    messages: messages.map((message) => toMessageDto(message, req)),
    nextCursor
});
