import { registerUser, verifyUser, loginUser, logoutUser, requestPasswordReset, confirmPasswordReset } from "../services/auth.service.js";
import { toRegisterResponseDto, toVerifyResponseDto, toLoginResponseDto, toPasswordResetResponseDto, toConfirmPasswordResetResponseDto } from "../dtos/auth.dto.js";
import { parseCookies } from "../utils/cookieparser.js";
import { env } from "../config/env.js";

export const register = async (req, res) => {
    const { email } = req.validated.body;
    const result = await registerUser(email);
    res.status(201).json(toRegisterResponseDto(result));
};

export const verify = async (req, res) => {
    const { email, pinCode, username, password, passwordConfirmation } = req.validated.body;
    const result = await verifyUser({ email, pinCode, username, password, passwordConfirmation });
    res.status(200).json(toVerifyResponseDto(result));
};

export const login = async (req, res) => {
    const { email, password } = req.validated.body;
    const result = await loginUser({ email, password });

    res.cookie(result.cookieName, result.sessionToken, {
        httpOnly: true,
        secure: env.cookie.secure,
        sameSite: env.cookie.sameSite,
        domain: env.cookie.domain,
        expires: result.expiresAt
    });

    res.status(200).json(toLoginResponseDto(result));
};

export const logout = async (req, res) => {
    const cookies = req.cookies ?? parseCookies(req.headers.cookie);
    const sessionToken = cookies?.[env.cookie.name];

    await logoutUser(sessionToken);

    res.clearCookie(env.cookie.name, {
        httpOnly: true,
        secure: env.cookie.secure,
        sameSite: env.cookie.sameSite,
        domain: env.cookie.domain
    });

    res.status(200).end();
};

export const requestPasswordResetController = async (req, res) => {
    const { email } = req.validated.body;
    const result = await requestPasswordReset(email);
    res.status(200).json(toPasswordResetResponseDto(result));
};

export const confirmPasswordResetController = async (req, res) => {
    const { token, newPassword, passwordConfirmation } = req.validated.body;
    const result = await confirmPasswordReset({ token, newPassword, passwordConfirmation });
    res.status(200).json(toConfirmPasswordResetResponseDto(result));
};