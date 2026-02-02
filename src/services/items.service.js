import {
    createItemWithPhotos,
    getCategoryById,
    getCityById,
    getUserForItemCreate,
    listItems as listItemsRepository,
    countItems
} from "../repositories/items.repository.js";

const normalizeText = (value) => value?.trim();

const failIfUserNotFound = (user) => {
    if (!user) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        throw error;
    }
};

const failIfUserNotVerified = (user) => {
    if (!user.isVerified) {
        const error = new Error("Email address has not been verified. Please check your email for the verification PIN.");
        error.statusCode = 403;
        throw error;
    }
};

const failIfUserBlocked = (user) => {
    if (user.isBlocked) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 403;
        throw error;
    }
};

const failIfCategoryInvalid = (categoryId) => {
    const error = new Error(`Invalid category: ${categoryId}.`);
    error.statusCode = 400;
    throw error;
};

const failIfCityInvalid = (cityId) => {
    const error = new Error(`Invalid city: ${cityId}.`);
    error.statusCode = 400;
    throw error;
};

const failIfItemTypeInvalid = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
};

const validateItemPricing = ({ itemType, sellingPrice, lendingPrice, rentUnit }) => {
    if (itemType === "selling") {
        if (!sellingPrice) {
            failIfItemTypeInvalid("Selling price is required for selling items.");
        }
        if (lendingPrice || rentUnit) {
            failIfItemTypeInvalid("Selling items cannot have lending price or rent unit.");
        }
    }

    if (itemType === "lending") {
        if (!lendingPrice || !rentUnit) {
            failIfItemTypeInvalid("Lending price and rent unit are required for lending items.");
        }
        if (sellingPrice) {
            failIfItemTypeInvalid("Lending items cannot have selling price.");
        }
    }

    if (itemType === "giveaway") {
        if (sellingPrice || lendingPrice || rentUnit) {
            failIfItemTypeInvalid("Giveaway items cannot have prices or rent unit.");
        }
    }
};

export const createItem = async ({
    userId,
    title,
    categoryId,
    brandName,
    condition,
    description,
    address,
    cityId,
    itemType,
    sellingPrice,
    lendingPrice,
    rentUnit,
    photos
}) => {
    const user = await getUserForItemCreate(userId);
    failIfUserNotFound(user);
    failIfUserNotVerified(user);
    failIfUserBlocked(user);

    const category = await getCategoryById(categoryId);
    if (!category) {
        failIfCategoryInvalid(categoryId);
    }

    const city = await getCityById(cityId);
    if (!city) {
        failIfCityInvalid(cityId);
    }

    validateItemPricing({ itemType, sellingPrice, lendingPrice, rentUnit });

    const data = {
        ownerId: userId,
        title: normalizeText(title),
        categoryId: category.id,
        brandName: normalizeText(brandName),
        condition,
        description: normalizeText(description),
        address: normalizeText(address),
        cityId: city.id,
        itemType,
        sellingPrice: sellingPrice ?? null,
        lendingPrice: lendingPrice ?? null,
        rentUnit: rentUnit ?? null,
        photos: {
            create: photos
        }
    };

    return createItemWithPhotos(data);
};

const buildPriceFilter = ({ itemType, minPrice, maxPrice }) => {
    if (minPrice === undefined && maxPrice === undefined) return null;

    const range = {};
    if (minPrice !== undefined) range.gte = minPrice;
    if (maxPrice !== undefined) range.lte = maxPrice;

    if (itemType === "selling") {
        return { sellingPrice: range };
    }
    if (itemType === "lending") {
        return { lendingPrice: range };
    }

    if (itemType === "giveaway") {
        return { __noResults: true };
    }

    return {
        OR: [{ sellingPrice: range }, { lendingPrice: range }]
    };
};

const buildOrderBy = ({ itemType, sortBy, sortOrder }) => {
    const order = sortOrder ?? "desc";
    if (sortBy === "price") {
        if (itemType === "lending") return { lendingPrice: order };
        if (itemType === "selling") return { sellingPrice: order };
        return [{ sellingPrice: order }, { lendingPrice: order }, { createdAt: "desc" }];
    }
    return { createdAt: order };
};

export const listItems = async ({
    search,
    city,
    itemType,
    condition,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page = 1,
    limit = 20
} = {}) => {
    const priceFilter = buildPriceFilter({ itemType, minPrice, maxPrice });
    if (priceFilter?.__noResults) {
        return {
            items: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0
            }
        };
    }

    const where = {
        status: "published",
        isDisabledByAdmin: false
    };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brandName: { contains: search, mode: "insensitive" } }
        ];
    }

    if (city) {
        where.city = { name: { contains: city, mode: "insensitive" } };
    }

    if (itemType) {
        where.itemType = itemType;
    }

    if (condition) {
        where.condition = condition;
    }

    if (priceFilter) {
        where.AND = [...(where.AND ?? []), priceFilter];
    }

    const safeLimit = Math.min(limit, 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
        listItemsRepository({
            where,
            orderBy: buildOrderBy({ itemType, sortBy, sortOrder }),
            skip,
            take: safeLimit
        }),
        countItems(where)
    ]);

    return {
        items,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: total ? Math.ceil(total / safeLimit) : 0
        }
    };
};
