import app from "./app.js";
import { env } from "./config/env.js";
import { seedCategories } from "./seeders/categories.seeder.js";
import {login} from "./controllers/auth.controller.js";

const startServer = async () => {
    try {
        await seedCategories();
    } catch (error) {
        console.error("Failed to seed categories:", error);
    }

    app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
};

void startServer();