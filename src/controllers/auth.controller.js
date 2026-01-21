import { registerUser, verifyUser, loginUser, logoutUser } from "../services/auth.service.js";
import { toRegisterResponseDto, toVerifyResponseDto, toLoginResponseDto } from "../dtos/auth.dto.js";

export const register = async (req, res) => {
    const { email } = req.validated.body;
    const result = await registerUser(email);
    res.status(201).json(toRegisterResponseDto(result));
};

export const verify = async (req, res) => {
    const { email, pinCode, password, passwordConfirmation } = req.validated.body;
    const result = await verifyUser({ email, pinCode, password, passwordConfirmation });
    res.status(200).json(toVerifyResponseDto(result));
};

export const login = async (req, res) => {
    const { email, password } = req.validated.body;
    const result = await loginUser({ email, password });

    res.cookie(result.cookieName, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: result.expiresAt
    });

    res.status(200).json(toLoginResponseDto(result));
};

const parseCookies = (cookieHeader = "") =>
    cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .reduce((acc, cookie) => {
            const separatorIndex = cookie.indexOf("=");
            if (separatorIndex === -1) return acc;
            const key = cookie.slice(0, separatorIndex).trim();
            const value = cookie.slice(separatorIndex + 1).trim();
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});

export const logout = async (req, res) => {
    const cookies = req.cookies ?? parseCookies(req.headers.cookie);
    const sessionToken = cookies?.session;

    await logoutUser(sessionToken);

    res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).end();
};