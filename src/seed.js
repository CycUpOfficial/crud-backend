import { seedCategories } from "./seeders/categories.seeder.js";
import { seedCities } from "./seeders/cities.seeder.js";
import { seedFakeData } from "./seeders/fake.seeder.js";
import { seedExtendedFakeData } from "./seeders/extended.seeder.js";

const runSeed = async() => {
    try {
        await seedCategories();
        await seedCities();
        if (process.env.NODE_ENV === "development") {
            await seedFakeData();
            await seedExtendedFakeData();

            // Seed chat data - optional (MongoDB-dependent)
            try {
                const { seedChatData } = await
                import ("./seeders/chat.seeder.js");
                await seedChatData();
            } catch (error) {
                console.warn("Chat seeding skipped:", error.message);
            }
        }
        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed data", error);
        process.exit(1);
    }
};

void runSeed();