import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true }
    },
    { _id: false }
);

const MessageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true
        },
        senderId: { type: String, required: true },
        text: { type: String, default: null },
        file: { type: FileSchema, default: null }
    },
    { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", MessageSchema);
