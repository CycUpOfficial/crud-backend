import { prisma } from "../db/index.js";

export const countUserItems = async (where) => {
    return prisma.item.count({ where });
};

export const findUserItems = async ({
                                        userId,
                                        status,
                                        skip,
                                        take
                                    }) => {
    const where = {
        ownerId: userId,
        ...(status ? { status } : {})
    };

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take,
            include: {
                category: {
                    select: { name: true }
                },
                city: {
                    select: { name: true }
                },
                photos: {
                    where: { isMain: true },
                    select: {
                        photoUrl: true,
                        isMain: true
                    }
                }
            }
        }),
        prisma.item.count({ where })
    ]);

    return { items, total };
};

export const getSellerRatings = async (sellerId) => {
    const ratings = await prisma.rating.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        include: {
            rater: {
                select: {
                    id: true,
                    firstName: true,
                    familyName: true
                }
            }
        }
    });

    const aggregation = await prisma.rating.aggregate({
        where: { sellerId },
        _avg: {
            rating: true
        },
        _count: {
            rating: true
        }
    });

    return {
        ratings,
        overallRating: aggregation._avg.rating,
        totalRatings: aggregation._count.rating
    };
};
