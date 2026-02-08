import { prisma } from "../db/index.js";

export const createSavedSearch = async ({
                                            userId,
                                            emailEnabled,
                                            inAppEnabled,
                                            searchTerm
                                        }) => {
    return prisma.savedSearch.create({
        data: {
            userId,
            emailEnabled,
            inAppEnabled,
            terms: {
                create: [{ searchTerm }]
            }
        },
        include: {
            terms: {
                select: { searchTerm: true }
            }
        }
    });
};

export const getSavedSearchesByUserId = async (userId) => {
    return prisma.savedSearch.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            terms: {
                select: { searchTerm: true }
            }
        }
    });
};

export const getSavedSearchByIdForUser = async ({ searchId, userId }) => {
    return prisma.savedSearch.findFirst({
        where: {
            id: searchId,
            userId
        },
        include: {
            terms: {
                select: { id: true, searchTerm: true }
            }
        }
    });
};

export const updateSavedSearchSettings = async ({ searchId, userId, emailEnabled, inAppEnabled }) => {
    return prisma.savedSearch.updateMany({
        where: { id: searchId, userId },
        data: {
            ...(emailEnabled !== undefined ? { emailEnabled } : {}),
            ...(inAppEnabled !== undefined ? { inAppEnabled } : {})
        }
    });
};

export const updateSavedSearchTerm = async ({ termId, searchTerm }) => {
    return prisma.savedSearchTerm.update({
        where: { id: termId },
        data: { searchTerm }
    });
};

export const deleteSavedSearchByIdForUser = async ({ searchId, userId }) => {
    return prisma.savedSearch.deleteMany({
        where: { id: searchId, userId }
    });
};
