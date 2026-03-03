import {
    getCurrentUserProfile,
    updateUserProfile,
    updateUserName,
    updateUserAddress,
    updateUserPhone,
    updateUserImage
} from "../services/profile.service.js";
import { toUserProfileDto } from "../dtos/profile.dto.js";
import { parseSingleFile, saveImage } from "../storage/storage.service.js";
import {
    updateProfileSchema,
    updateNameSchema,
    updateAddressSchema,
    updatePhoneSchema,
    updateProfileImageSchema
} from "../validators/profile.validator.js";

export const getProfile = async(req, res) => {
    const user = await getCurrentUserProfile(req.auth.userId);
    res.status(200).json(toUserProfileDto(user, req));
};

export const updateProfile = async(req, res) => {
    const { body, file } = await parseSingleFile({
        req,
        res,
        fieldName: "profileImage",
        allowedMimeTypes: ["image/jpeg", "image/png"],
        maxFileSize: 3 * 1024 * 1024
    });

    const result = updateProfileSchema.safeParse({
        body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        const firstIssue = result.error.issues ?.[0];
        const message = firstIssue ?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }

    const { username, firstName, familyName, address, postalCode, city, phoneNumber } = result.data.body;
    const uploadedImage = file ?
        await saveImage({ file, folder: "profile-images" }) :
        null;
    const profileImageUrl = uploadedImage ?.url;

    const user = await updateUserProfile({
        userId: req.auth.userId,
        username,
        firstName,
        familyName,
        address,
        postalCode,
        city,
        phoneNumber,
        profileImageUrl
    });

    res.status(200).json(toUserProfileDto(user, req));
};

// new controllers for partial routes

export const updateName = async(req, res) => {
    const result = updateNameSchema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });
    if (!result.success) {
        const firstIssue = result.error.issues ?.[0];
        const message = firstIssue ?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }
    const { firstName, familyName } = result.data.body;
    const user = await updateUserName({
        userId: req.auth.userId,
        firstName,
        familyName
    });
    res.status(200).json(toUserProfileDto(user, req));
};

export const updateAddress = async(req, res) => {
    const result = updateAddressSchema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });
    if (!result.success) {
        const firstIssue = result.error.issues ?.[0];
        const message = firstIssue ?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }
    const { address, postalCode, city } = result.data.body;
    const user = await updateUserAddress({
        userId: req.auth.userId,
        address,
        postalCode,
        city
    });
    res.status(200).json(toUserProfileDto(user, req));
};

export const updatePhone = async(req, res) => {
    const result = updatePhoneSchema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });
    if (!result.success) {
        const firstIssue = result.error.issues ?.[0];
        const message = firstIssue ?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }
    const { phoneNumber } = result.data.body;
    const user = await updateUserPhone({
        userId: req.auth.userId,
        phoneNumber
    });
    res.status(200).json(toUserProfileDto(user, req));
};

export const updateProfileImage = async(req, res) => {
    const { body, file } = await parseSingleFile({
        req,
        res,
        fieldName: "profileImage",
        allowedMimeTypes: ["image/jpeg", "image/png"],
        maxFileSize: 3 * 1024 * 1024
    });

    const result = updateProfileImageSchema.safeParse({
        body,
        params: req.params,
        query: req.query
    });
    if (!result.success) {
        const firstIssue = result.error.issues ?.[0];
        const message = firstIssue ?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }

    if (!file) {
        const error = new Error("No file uploaded.");
        error.statusCode = 400;
        throw error;
    }

    const uploadedImage = await saveImage({ file, folder: "profile-images" });
    const user = await updateUserImage({
        userId: req.auth.userId,
        profileImageUrl: uploadedImage.url
    });
    res.status(200).json(toUserProfileDto(user, req));
};