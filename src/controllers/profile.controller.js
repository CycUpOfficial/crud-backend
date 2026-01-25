import { getCurrentUserProfile, updateUserProfile } from "../services/profile.service.js";
import { toUserProfileDto } from "../dtos/profile.dto.js";

export const getProfile = async (req, res) => {
    const user = await getCurrentUserProfile(req.auth.userId);
    res.status(200).json(toUserProfileDto(user, req));
};

export const updateProfile = async (req, res) => {
    const { firstName, familyName, address, postalCode, city, phoneNumber } = req.validated.body;
    const profileImageUrl = req.file
        ? `/uploads/profile-images/${req.file.filename}`
        : undefined;

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

    res.status(200).json(toUserProfileDto(user, req));
};
