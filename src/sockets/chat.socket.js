import { parseCookies } from "../utils/cookieparser.js";
import { deleteSessionByToken, getSessionByToken } from "../repositories/auth.repository.js";
import { getChatMessages, listUserChats, sendChatMessage, startChat } from "../services/chat.service.js";

const respond = (callback, payload) => {
    if (typeof callback === "function") {
        callback(payload);
    }
};

const toSocketError = (error) => ({
    message: error?.message ?? "Unexpected error."
});

export const registerChatSocket = (io) => {
    io.use(async (socket, next) => {
        try {
            const cookies = parseCookies(socket.handshake.headers.cookie ?? "");
            const sessionToken = cookies?.session;
            if (!sessionToken) {
                return next(new Error("Not authorized to take this action."));
            }

            const session = await getSessionByToken(sessionToken);
            if (!session) {
                return next(new Error("Not authorized to take this action."));
            }

            const isExpired = session.expiresAt && new Date(session.expiresAt) < new Date();
            if (isExpired) {
                await deleteSessionByToken(sessionToken);
                return next(new Error("Not authorized to take this action."));
            }

            socket.data.userId = session.userId;
            socket.data.sessionToken = sessionToken;
            return next();
        } catch (error) {
            return next(error);
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        const userRoom = `user:${userId}`;

        socket.join(userRoom);

        socket.on("chat:start", async (payload, callback) => {
            try {
                const chat = await startChat({
                    userId,
                    itemId: payload?.itemId,
                    otherUserId: payload?.otherUserId
                });

                const chatRoom = `chat:${chat._id?.toString?.() ?? chat.id}`;
                socket.join(chatRoom);

                respond(callback, { ok: true, chat });
                io.to(userRoom).emit("chat:started", chat);
                io.to(`user:${payload?.otherUserId}`).emit("chat:started", chat);
            } catch (error) {
                respond(callback, { ok: false, error: toSocketError(error) });
            }
        });

        socket.on("chat:list", async (payload, callback) => {
            try {
                const result = await listUserChats({
                    userId,
                    page: payload?.page,
                    limit: payload?.limit
                });

                respond(callback, { ok: true, ...result });
            } catch (error) {
                respond(callback, { ok: false, error: toSocketError(error) });
            }
        });

        socket.on("chat:messages", async (payload, callback) => {
            try {
                const result = await getChatMessages({
                    userId,
                    chatId: payload?.chatId,
                    limit: payload?.limit,
                    before: payload?.before
                });

                respond(callback, { ok: true, ...result });
            } catch (error) {
                respond(callback, { ok: false, error: toSocketError(error) });
            }
        });

        socket.on("message:send", async (payload, callback) => {
            try {
                const message = await sendChatMessage({
                    userId,
                    chatId: payload?.chatId,
                    text: payload?.text,
                    file: payload?.file
                });

                const chatRoom = `chat:${payload?.chatId}`;
                socket.join(chatRoom);
                io.to(chatRoom).emit("message:new", message);
                respond(callback, { ok: true, message });
            } catch (error) {
                respond(callback, { ok: false, error: toSocketError(error) });
            }
        });
    });
};
