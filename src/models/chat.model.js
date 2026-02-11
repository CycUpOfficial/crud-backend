import mongoose from "mongoose";

const ItemSnapshotSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        itemType: { type: String, required: true },
        sellingPrice: { type: Number, default: null },
        lendingPrice: { type: Number, default: null },
        rentUnit: { type: String, default: null },
        city: { type: String, default: null },
        mainImage: { type: String, default: null },
        ownerId: { type: String, required: true }
    },
    { _id: false }
);

const ChatSchema = new mongoose.Schema(
    {
        itemId: { type: String, required: true },
        participants: { type: [String], required: true },
        participantKey: { type: String, required: true },
        itemSnapshot: { type: ItemSnapshotSchema, required: true },
        lastMessageAt: { type: Date, default: null },
        lastMessagePreview: { type: String, default: null }
    },
    { timestamps: true }
);

ChatSchema.index({ itemId: 1, participantKey: 1 }, { unique: true });
ChatSchema.index({ participants: 1 });

export const Chat = mongoose.model("Chat", ChatSchema);
