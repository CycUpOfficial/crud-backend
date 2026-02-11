import {getCityByName, getUserByUsername, getUserProfileById, updateUserProfileById} from "../repositories/profile.repository.js";

const normalizeText = (value) => value?.trim();
const normalizeUsername = (value) => value?.trim();

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
    username,
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

    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername && normalizedUsername !== user.username) {
        const existingUser = await getUserByUsername(normalizedUsername);
        if (existingUser && existingUser.id !== userId) {
            const error = new Error("A user with this username already exists.");
            error.statusCode = 400;
            throw error;
        }
    }

    const cityName = normalizeText(city);
    const cityRecord = await getCityByName(cityName);
    if (!cityRecord) {
        failIfCityInvalid(cityName);
    }

    const updateData = {
        username: normalizedUsername,
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
