import { prisma } from "../db/index.js";

export const getAdminAnalytics = async () => {
    const [
        totalDonations,
        totalSales,
        totalRents,
        totalUsers,
        totalItems
    ] = await Promise.all([
        prisma.item.count({
            where: { itemType: "giveaway" }
        }),
        prisma.item.count({
            where: { status: "sold", itemType: "selling" }
        }),
        prisma.item.count({
            where: { itemType: "lending" }
        }),
        prisma.user.count(),
        prisma.item.count()
    ]);

    return {
        totalDonations,
        totalSales,
        totalRents,
        totalUsers,
        totalItems
    };
};

export const getAdminUsers = async ({ search, page, limit }) => {
    const where = search
        ? {
            OR: [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { familyName: { contains: search, mode: "insensitive" } }
            ]
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                city: { select: { name: true } }
            }
        }),
        prisma.user.count({ where })
    ]);

    return { users, total };
};

export const getAdminReportsRepo = async ({ startDate, endDate, page, limit }) => {
    const where = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.report.count({ where })
    ]);

    return { reports, total };
};

export const findItemById = async (itemId) => {
    return prisma.item.findUnique({
        where: { id: itemId }
    });
};

export const disableItemByAdmin = async (itemId) => {
    return prisma.item.update({
        where: { id: itemId },
        data: {
            isDisabledByAdmin: true,
            status: "disabled"
        }
    });
};

export const deleteItemByAdmin = async (itemId) => {
    return prisma.item.delete({
        where: { id: itemId }
    });
};

export const findUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId }
    });
};

export const blockUserById = async ({ userId, reason }) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: true,
            blockReason: reason
        }
    });
};

export const unblockUserById = async (userId) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: false
        }
    });
};

export const createAdminReport = async ({ reporterId, reportedUserId, description }) => {
    return prisma.report.create({
        data: {
            reporterId,
            reportedUserId,
            description
        },
        select: { id: true }
    });
};


