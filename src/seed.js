import { seedCategories } from "./seeders/categories.seeder.js";
import { seedCities } from "./seeders/cities.seeder.js";
import { seedFakeData } from "./seeders/fake.seeder.js";

const runSeed = async () => {
    try {
        await seedCategories();
        await seedCities();
        if(process.env.NODE_ENV === "development"){
            await seedFakeData();
        }
        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed data", error);
        process.exit(1);
    }
};

void runSeed();
