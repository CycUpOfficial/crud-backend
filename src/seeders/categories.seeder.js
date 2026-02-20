import { prisma } from "../db/index.js";

const CATEGORY_SEED = [
    {
        name: "Electronics",
        children: ["Computers", "Phones", "Audio", "Gaming"]
    },
    {
        name: "Furniture",
        children: ["Bedroom", "Living Room", "Office"]
    },
    {
        name: "Books",
        children: ["Textbooks", "Fiction", "Non-fiction"]
    },
    {
        name: "Clothing",
        children: ["Men", "Women", "Accessories"]
    },
    {
        name: "Sports & Outdoors",
        children: ["Fitness", "Cycling", "Camping"]
    },
    {
        name: "Home & Garden",
        children: ["Kitchen", "Decor", "Tools"]
    },
    {
        name: "Vehicles",
        children: ["Bicycles", "Scooters", "Car Accessories"]
    },
    {
        name: "Services",
        children: ["Tutoring", "Repairs", "Moving"]
    },
    {
        name: "Other",
        children: []
    }
];

export const seedCategories = async () => {
    for (const category of CATEGORY_SEED) {
        const parent = await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: { name: category.name }
        });

        for (const childName of category.children) {
            await prisma.category.upsert({
                where: { name: childName },
                update: { parentId: parent.id },
                create: {
                    name: childName,
                    parentId: parent.id
                }
            });
        }
    }
};
// todo: Transfer this to a repository.