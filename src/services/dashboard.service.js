import {
    countUserItems,
    findUserItems,
    getSellerRatings
} from "../repositories/dashboard.repository.js";

export const getDashboardAnalytics = async (userId) => {
    const [
        totalPosted,
        totalSold,
        totalGivenAway,
        totalRented,
        activeItems
    ] = await Promise.all([
        countUserItems({ ownerId: userId }),
        countUserItems({ ownerId: userId, status: "sold" }),
        countUserItems({ ownerId: userId, itemType: "giveaway" }),
        countUserItems({ ownerId: userId, itemType: "lending" }),
        countUserItems({
            ownerId: userId,
            status: "published",
            isDisabledByAdmin: false
        })
    ]);

    return {
        totalPosted,
        totalSold,
        totalGivenAway,
        totalRented,
        activeItems
    };
};


export const getDashboardItems = async ({
                                            userId,
                                            status,
                                            page,
                                            limit
                                        }) => {
    const skip = (page - 1) * limit;

    const { items, total } = await findUserItems({
        userId,
        status,
        skip,
        take: limit
    });

    return {
        items: items.map(item => ({
            id: item.id,
            title: item.title,
            categoryId: item.categoryId,
            category: item.category?.name,
            brandName: item.brandName,
            condition: item.condition,
            description: item.description,
            address: item.address,
            cityId: item.cityId,
            city: item.city?.name,
            itemType: item.itemType,
            sellingPrice: item.sellingPrice,
            lendingPrice: item.lendingPrice,
            rentUnit: item.rentUnit,
            photos: item.photos.map(p => ({
                url: p.photoUrl,
                isMain: p.isMain
            })),
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};


export const getDashboardRatings = async (userId) => {
    const {
        ratings,
        overallRating,
        totalRatings
    } = await getSellerRatings(userId);

    return {
        overallRating: overallRating ? Number(overallRating.toFixed(1)) : 0,
        totalRatings,
        ratings: ratings.map(rating => ({
            id: rating.id,
            itemId: rating.itemId,
            rating: rating.rating,
            comment: rating.comment,
            raterId: rating.raterId,
            raterName: `${rating.rater.firstName ?? ""} ${rating.rater.familyName ?? ""}`.trim(),
            createdAt: rating.createdAt
        }))
    };
};
