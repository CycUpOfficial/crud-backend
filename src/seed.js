import { seedCategories } from "./seeders/categories.seeder.js";
import { seedCities } from "./seeders/cities.seeder.js";
import { seedFakeData } from "./seeders/fake.seeder.js";
import { seedExtendedFakeData } from "./seeders/extended.seeder.js";

// lightweight argument parsing (no extra dependency)
const args = process.argv.slice(2);
const force = args.includes("--force") || process.env.FORCE_SEED === "true";

const runSeed = async() => {
    try {
        console.log("starting base seed...");
        await seedCategories();
        await seedCities();
        if (process.env.NODE_ENV === "development") {
            console.log("development mode detected, running fake data seeder");
            await seedFakeData({ force });
            await seedExtendedFakeData({ force });

            // Seed chat data - optional (MongoDB-dependent)
            try {
                const { seedChatData } = await
                import ("./seeders/chat.seeder.js");
                await seedChatData();
            } catch (error) {
                console.warn("Chat seeding skipped:", error.message);
            }
        } else {
            console.log("skipping fake data; NODE_ENV=", process.env.NODE_ENV);
        }
        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed data", error);
        process.exit(1);
    }
};

void runSeed();