export const adminUserDto = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    familyName: user.familyName,
    address: user.address,
    postalCode: user.postalCode,
    city: user.city?.name ?? null,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImageUrl,
    verified: user.isVerified,
    createdAt: user.createdAt
});
export const adminReportDto = (report) => ({
    id: report.id,
    description: report.description,
    createdAt: report.createdAt
});
