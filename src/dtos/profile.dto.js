const buildProfileImageUrl = (req, profileImageUrl) => {
    if (!profileImageUrl) return null;
    if (profileImageUrl.startsWith("http://") || profileImageUrl.startsWith("https://")) {
        return profileImageUrl;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    if (profileImageUrl.startsWith("/")) {
        return `${baseUrl}${profileImageUrl}`;
    }
    return `${baseUrl}/${profileImageUrl}`;
};

export const toUserProfileDto = (user, req) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    familyName: user.familyName,
    address: user.address,
    postalCode: user.postalCode,
    city: user.city?.name ?? null,
    phoneNumber: user.phoneNumber,
    profileImage: buildProfileImageUrl(req, user.profileImageUrl),
    verified: user.isVerified,
    createdAt: user.createdAt
});
