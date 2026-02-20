import { Chat } from "../models/chat.model.js";
import { ChatMessage } from "../models/message.model.js";
import { prisma } from "../db/index.js";

export const seedChatData = async() => {
    try {
        const chatCount = await Chat.countDocuments();

        if (chatCount === 0) {
            // Get some items and users from PostgreSQL
            const items = await prisma.item.findMany({
                where: { status: "published" },
                include: { owner: true, city: true, photos: true },
                take: 3
            });

            if (items.length < 2) {
                console.log("Not enough items for chat seeding. Skipping...");
                return;
            }

            // Get some users
            const users = await prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "asc" }
            });

            if (users.length < 2) {
                console.log("Not enough users for chat seeding. Skipping...");
                return;
            }

            // Create chats for items
            const chatsToCreate = [];
            for (let i = 0; i < Math.min(items.length, 2); i++) {
                const item = items[i];
                const buyer = users[(i + 1) % users.length];

                // Don't create chat if buyer is the owner
                if (buyer.id === item.ownerId) continue;

                const participantKey = [item.ownerId, buyer.id].sort().join("_");

                chatsToCreate.push({
                    itemId: item.id,
                    participants: [item.ownerId, buyer.id],
                    participantKey,
                    itemSnapshot: {
                        id: item.id,
                        title: item.title,
                        itemType: item.itemType,
                        sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : null,
                        lendingPrice: item.lendingPrice ? Number(item.lendingPrice) : null,
                        rentUnit: item.rentUnit,
                        city: (item.city && item.city.name) || null,
                        mainImage: item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : null,
                        ownerId: item.ownerId
                    },
                    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    lastMessagePreview: "Is this item still available?"
                });
            }

            const createdChats = await Chat.insertMany(chatsToCreate);
            console.log(`Created ${createdChats.length} chat conversations`);

            // Create messages for chats
            const messagesToCreate = [];
            for (const chat of createdChats) {
                const messages = [{
                        chatId: chat._id,
                        senderId: chat.participants[1],
                        text: "Hi! Is this item still available?"
                    },
                    {
                        chatId: chat._id,
                        senderId: chat.participants[0],
                        text: "Yes, it's still available! Great item."
                    },
                    {
                        chatId: chat._id,
                        senderId: chat.participants[1],
                        text: "Can I pickup this weekend?"
                    },
                    {
                        chatId: chat._id,
                        senderId: chat.participants[0],
                        text: "Sure! Saturday afternoon works for me."
                    }
                ];

                messagesToCreate.push(...messages);
            }

            if (messagesToCreate.length > 0) {
                await ChatMessage.insertMany(messagesToCreate);
                console.log(`Created ${messagesToCreate.length} chat messages`);
            }
        }
    } catch (error) {
        console.error("Error seeding chat data:", error.message);
        // Don't throw - MongoDB might not be needed in all environments
    }
};