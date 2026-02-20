import { Server } from "socket.io";
import { env } from "../config/env.js";
import { registerChatSocket } from "./chat.socket.js";

export const createSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: env.frontend.url,
            credentials: true
        },
        maxHttpBufferSize: 6 * 1024 * 1024
    });

    registerChatSocket(io);
    return io;
};
