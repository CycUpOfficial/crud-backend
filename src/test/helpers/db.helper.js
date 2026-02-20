import {prisma} from "../../db/index.js";
import {seedCities} from "../../seeders/cities.seeder.js";
import {seedCategories} from "../../seeders/categories.seeder.js";

export const connectTestDb = async () => {
    await prisma.$connect();
};

export const disconnectTestDb = async () => {
    await prisma.$disconnect();
};

export const clearDatabase = async () => {
    await prisma.savedSearchTerm.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.itemPhoto.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.verificationPin.deleteMany();
    await prisma.report.deleteMany();
    await prisma.item.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.city.deleteMany();
};

export const ensureBaseCity = async () => {
    const existing = await prisma.city.findFirst({orderBy: {createdAt: "asc"}});
    if (existing) return existing;
};

export const ensureBaseCategory = async () => {
    const existing = await prisma.category.findFirst({orderBy: {createdAt: "asc"}});
    if (existing) return existing;
};

export const ensureBaseData = async () => {
    await seedCategories();
    await seedCities();
};
