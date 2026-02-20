// noinspection NpmUsedModulesInstalled,JSUnresolvedReference

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

const adapter = new PrismaPg({ connectionString: env.db.url });
const prisma = new PrismaClient({ adapter });

export { prisma }
/**
 * Checks database connectivity
 */
export const checkDbConnection = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
