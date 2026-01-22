export const toRegisterResponseDto = (result) => ({
    message: result.message,
    userId: result.userId
});

export const toVerifyResponseDto = (result) => ({
    message: result.message,
    verified: result.verified
});

export const toLoginResponseDto = (result) => ({
    userId: result.userId
});

export const toPasswordResetResponseDto = (result) => ({
    message: result.message
});

export const toConfirmPasswordResetResponseDto = (result) => ({
    message: result.message
});