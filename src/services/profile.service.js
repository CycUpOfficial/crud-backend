import {getCityByName, getUserProfileById, updateUserProfileById} from "../repositories/profile.repository.js";

const normalizeText = (value) => value?.trim();

function failIfUserNotFound(user) {
    if (!user) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        throw error;
    }
}

function failIfCityInvalid(cityName) {
    const error = new Error(`Invalid city: ${cityName}.`);
    error.statusCode = 400;
    throw error;
}

export const getCurrentUserProfile = async (userId) => {
    const user = await getUserProfileById(userId);
    failIfUserNotFound(user);
    return user;
};

export const updateUserProfile = async ({
    userId,
    firstName,
    familyName,
    address,
    postalCode,
    city,
    phoneNumber,
    profileImageUrl
}) => {
    const user = await getUserProfileById(userId);
    failIfUserNotFound(user);

    const cityName = normalizeText(city);
    const cityRecord = await getCityByName(cityName);
    if (!cityRecord) {
        failIfCityInvalid(cityName);
    }

    const updateData = {
        firstName: normalizeText(firstName),
        familyName: normalizeText(familyName),
        address: normalizeText(address),
        postalCode: normalizeText(postalCode),
        phoneNumber: normalizeText(phoneNumber),
        cityId: cityRecord.id
    };

    if (profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl;
    }

    return updateUserProfileById(userId, updateData);
};
