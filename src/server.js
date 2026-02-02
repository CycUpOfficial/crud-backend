import app from "./app.js";
import { env } from "./config/env.js";
import { seedCategories } from "./seeders/categories.seeder.js";
import { seedCities } from "./seeders/cities.seeder.js";

const startServer = async () => {
    try {
        await seedCategories();
        await seedCities();
        //todo: extract seeders. 
    } catch (error) {
        console.error("Failed to seed data", error);
    }

    app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
};

void startServer();