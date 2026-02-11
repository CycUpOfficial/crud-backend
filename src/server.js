import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/mongoose.js";
import { seedCategories } from "./seeders/categories.seeder.js";
import { seedCities } from "./seeders/cities.seeder.js";
import { createSocketServer } from "./sockets/index.js";

const startServer = async () => {
    try {
        await seedCategories();
        await seedCities();
        //todo: extract seeders. 
    } catch (error) {
        console.error("Failed to seed data", error);
    }

    await connectMongo();

    const server = http.createServer(app);
    createSocketServer(server);

    server.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
};

void startServer();