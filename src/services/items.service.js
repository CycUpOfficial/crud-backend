import { createItemWithPhotos, getCategoryById, getCityById, getUserForItemCreate } from "../repositories/items.repository.js";

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
