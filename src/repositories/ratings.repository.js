import { prisma } from "../db/index.js";

export const createRating = async ({
                                       itemId,
                                       sellerId,
                                       raterId,
                                       rating,
                                       comment
                                   }) => {
    return prisma.rating.create({
        data: {
            itemId,
            sellerId,
            raterId,
            rating,
            comment
        },
        select: {
            id: true,
            itemId: true,
            rating: true,
            comment: true,
            raterId: true,
            createdAt: true,
            rater: {
                select: {
                    firstName: true,
                    familyName: true
                }
            }
        }
    });
};
