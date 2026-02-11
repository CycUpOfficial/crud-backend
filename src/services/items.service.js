import {
    createItemWithPhotos,
    getCategoryById,
    getCityById,
    getUserForItemCreate,
    getItemById,
    getItemWithDetails,
    listRelatedItemIds,
    listItems as listItemsRepository,
    countItems,
    updateItemById,
    updateItemWithPhotos,
    softDeleteItemById,
    markItemAsSoldById
} from "../repositories/items.repository.js";
import { getUserByEmail } from "../repositories/auth.repository.js";

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

const failIfItemNotFound = () => {
    const error = new Error("Not found.");
    error.statusCode = 404;
    throw error;
};

const failIfItemNotOwned = () => {
    const error = new Error("Not authorized to take this action.");
    error.statusCode = 403;
    throw error;
};

const failIfItemNotUpdatable = () => {
    const error = new Error("Item cannot be updated.");
    error.statusCode = 400;
    throw error;
};

const failIfItemAlreadySold = () => {
    const error = new Error("This item has already been marked as sold.");
    error.statusCode = 400;
    throw error;
};

const failIfBuyerNotFound = () => {
    const error = new Error("Buyer with this email address not found in the system.");
    error.statusCode = 400;
    throw error;
};

const failIfBuyerIsOwner = () => {
    const error = new Error("You cannot mark yourself as the buyer of your own item.");
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

export const getItemDetails = async ({ itemId }) => {
    const item = await getItemWithDetails(itemId);
    if (!item || item.status !== "published" || item.isDisabledByAdmin) {
        failIfItemNotFound();
    }
    const relatedItems = await listRelatedItemIds({
        itemId,
        categoryId: item.categoryId
    });

    return {
        ...item,
        relatedItemIds: relatedItems.map((related) => related.id)
    };
};

export const updateItem = async ({
    itemId,
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

    const item = await getItemById(itemId);
    if (!item) {
        failIfItemNotFound();
    }

    if (item.ownerId !== userId) {
        failIfItemNotOwned();
    }

    if (item.status !== "published") {
        failIfItemNotUpdatable();
    }

    const nextItemType = itemType ?? item.itemType;
    let nextSellingPrice = sellingPrice ?? item.sellingPrice;
    let nextLendingPrice = lendingPrice ?? item.lendingPrice;
    let nextRentUnit = rentUnit ?? item.rentUnit;

    if (itemType && itemType !== item.itemType) {
        if (itemType === "giveaway") {
            nextSellingPrice = null;
            nextLendingPrice = null;
            nextRentUnit = null;
        } else if (itemType === "selling") {
            nextLendingPrice = null;
            nextRentUnit = null;
        } else if (itemType === "lending") {
            nextSellingPrice = null;
        }
    }

    validateItemPricing({
        itemType: nextItemType,
        sellingPrice: nextSellingPrice,
        lendingPrice: nextLendingPrice,
        rentUnit: nextRentUnit
    });

    const updateData = {};
    if (title !== undefined) updateData.title = normalizeText(title);
    if (brandName !== undefined) updateData.brandName = normalizeText(brandName);
    if (condition !== undefined) updateData.condition = condition;
    if (description !== undefined) updateData.description = normalizeText(description);
    if (address !== undefined) updateData.address = normalizeText(address);

    if (categoryId !== undefined) {
        const category = await getCategoryById(categoryId);
        if (!category) {
            failIfCategoryInvalid(categoryId);
        }
        updateData.categoryId = category.id;
    }

    if (cityId !== undefined) {
        const city = await getCityById(cityId);
        if (!city) {
            failIfCityInvalid(cityId);
        }
        updateData.cityId = city.id;
    }

    if (itemType !== undefined) updateData.itemType = nextItemType;
    if (sellingPrice !== undefined || itemType !== undefined) updateData.sellingPrice = nextSellingPrice ?? null;
    if (lendingPrice !== undefined || itemType !== undefined) updateData.lendingPrice = nextLendingPrice ?? null;
    if (rentUnit !== undefined || itemType !== undefined) updateData.rentUnit = nextRentUnit ?? null;

    if (photos?.length) {
        return updateItemWithPhotos(itemId, updateData, photos);
    }

    return updateItemById(itemId, updateData);
};

export const deleteItem = async ({ itemId, userId }) => {
    const item = await getItemById(itemId);
    if (!item) {
        failIfItemNotFound();
    }

    if (item.ownerId !== userId) {
        failIfItemNotOwned();
    }

    if (item.status === "deleted") {
        return { deleted: false };
    }

    await softDeleteItemById(itemId);
    return { deleted: true };
};

export const markItemAsSold = async ({ itemId, userId, buyerEmail }) => {
    const item = await getItemById(itemId);
    if (!item || item.isDisabledByAdmin) {
        failIfItemNotFound();
    }

    if (item.ownerId !== userId) {
        failIfItemNotOwned();
    }

    if (item.status === "sold") {
        failIfItemAlreadySold();
    }

    if (item.status === "deleted") {
        failIfItemNotFound();
    }

    const buyer = await getUserByEmail(buyerEmail);
    if (!buyer) {
        failIfBuyerNotFound();
    }

    if (buyer.id === item.ownerId) {
        failIfBuyerIsOwner();
    }

    return markItemAsSoldById({
        itemId,
        buyerId: buyer.id
    });
};
