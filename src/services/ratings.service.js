import { prisma } from "../db/index.js";
import { createRating } from "../repositories/ratings.repository.js";

export const submitRatingService = async ({
                                              itemId,
                                              raterId,
                                              rating,
                                              comment
                                          }) => {
    const item = await prisma.item.findUnique({
        where: { id: itemId },
        select: {
            id: true,
            ownerId: true,
            buyerId: true
        }
    });

    if (!item) {
        const err = new Error("Item ID not found!");
        err.statusCode = 404;
        throw err;
    }

    // Seller cannot rate themselves
    if (item.ownerId === raterId) {
        const err = new Error("Invalid input or not authorized to rate");
        err.statusCode = 400;
        throw err;
    }

    // Only buyer can rate seller
    const isBuyer = item.buyerId && item.buyerId === raterId;
    if (!isBuyer) {
        const err = new Error("Invalid input or not authorized to rate");
        err.statusCode = 400;
        throw err;
    }

    try {
        const created = await createRating({
            itemId,
            sellerId: item.ownerId,
            raterId,
            rating,
            comment
        });

        const raterName =
            `${created.rater?.firstName ?? ""} ${created.rater?.familyName ?? ""}`.trim();

        return {
            id: created.id,
            itemId: created.itemId,
            rating: created.rating,
            comment: created.comment,
            raterId: created.raterId,
            raterName,
            createdAt: created.createdAt
        };
    } catch (err) {
        if (err.code === "P2002") {
            const e = new Error("Invalid input or not authorized to rate");
            e.statusCode = 400;
            throw e;
        }
        throw err;
    }
};
