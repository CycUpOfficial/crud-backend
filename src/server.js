import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/mongoose.js";
import { createSocketServer } from "./sockets/index.js";

const startServer = async () => {
    await connectMongo();

    const server = http.createServer(app);
    createSocketServer(server);

    server.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
};

void startServer();