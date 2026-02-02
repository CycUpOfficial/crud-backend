import { getCurrentUserProfile, updateUserProfile } from "../services/profile.service.js";
import { toUserProfileDto } from "../dtos/profile.dto.js";
import { parseSingleFile, saveImage } from "../storage/storage.service.js";
import { updateProfileSchema } from "../validators/profile.validator.js";

export const getProfile = async (req, res) => {
    const user = await getCurrentUserProfile(req.auth.userId);
    res.status(200).json(toUserProfileDto(user, req));
};

export const updateProfile = async (req, res) => {
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
        const firstIssue = result.error.issues?.[0];
        const message = firstIssue?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }

    const { firstName, familyName, address, postalCode, city, phoneNumber } = result.data.body;
    const uploadedImage = file
        ? await saveImage({ file, folder: "profile-images" })
        : null;
    const profileImageUrl = uploadedImage?.url;
    // todo: we need a better validation.
    const user = await updateUserProfile({
        userId: req.auth.userId,
        firstName,
        familyName,
        address,
        postalCode,
        city,
        phoneNumber,
        profileImageUrl
    });
    // todo: we need to delete a profile image if a new one is uploaded.
    res.status(200).json(toUserProfileDto(user, req));
};
