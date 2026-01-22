import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
    getUserByEmail,
    createUserWithVerificationPin,
    getVerificationPinByUserId,
    verifyUserAndSetPassword,
    createSession,
    deleteSessionByToken,
    deleteSessionsByUserId,
    deletePasswordResetTokensByUserId,
    createPasswordResetToken,
    getPasswordResetTokenRecord,
    resetPasswordAndVerifyUser
} from "../repositories/auth.repository.js";
import { enqueueVerificationEmail, enqueuePasswordResetEmail } from "../queues/email.queue.js";

const TRUSTED_UNIVERSITY_DOMAINS = [
    "abo.fi",
    "utu.fi"
];

const PIN_LENGTH = 6;
const PIN_EXPIRY_MINUTES = 15;
const SESSION_EXPIRY_DAYS = 7;
const SESSION_TOKEN_BYTES = 32;
const SESSION_COOKIE_NAME = "session";
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MINUTES = 60;

const isUniversityEmail = (email) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1].toLowerCase();

    return TRUSTED_UNIVERSITY_DOMAINS.includes(domain);
};

const generatePinCode = () => {
    const min = 10 ** (PIN_LENGTH - 1);
    const max = 10 ** PIN_LENGTH - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

function failIfEmailFormatIsInvalid(email) {
    if (!isUniversityEmail(email)) {
        const error = new Error("Email must be a valid university email address.");
        error.statusCode = 400;
        throw error;
    }
}

async function failIfUserAlreadyExists(email) {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 400;
        throw error;
    }
}

async function sendVerificationEmail({email, pinCode}) {
    try {
        await enqueueVerificationEmail({email, pinCode});
    } catch (queueError) {
        const error = new Error("Failed to queue verification email.");
        error.statusCode = 500;
        error.cause = queueError;
        throw error;
    }
}

export const registerUser = async (email) => {
    failIfEmailFormatIsInvalid(email);
    await failIfUserAlreadyExists(email);

    const pinCode = generatePinCode();
    const expiresAt = new Date(Date.now() + PIN_EXPIRY_MINUTES * 60 * 1000);

    const user = await createUserWithVerificationPin(email, pinCode, expiresAt);
    await sendVerificationEmail({email, pinCode})

    return {
        message: "Registration successful. Please check your email for verification PIN.",
        userId: user.id
    };
};

function failIfPasswordsDoNotMatch(password, passwordConfirmation) {
    if (password !== passwordConfirmation) {
        const error = new Error("Passwords do not match. Please ensure both password fields are identical.");
        error.statusCode = 400;
        throw error;
    }
}

async function failIfUserNotFound(email) {
    const user = await getUserByEmail(email);
    if (!user) {
        const error = new Error("Not found.");
        error.statusCode = 404;
        throw error;
    }

    return user;
}

function failIfPinInvalid(pinRecord, pinCode) {
    if (!pinRecord) {
        const error = new Error("Invalid PIN code. Please check your email and try again.");
        error.statusCode = 400;
        throw error;
    }

    const isExpired = pinRecord.expiresAt && new Date(pinRecord.expiresAt) < new Date();
    const isMismatch = pinRecord.pinCode !== pinCode;

    if (isExpired || isMismatch) {
        const error = new Error("Invalid PIN code. Please check your email and try again.");
        error.statusCode = 400;
        throw error;
    }
}

export const verifyUser = async ({ email, pinCode, password, passwordConfirmation }) => {
    failIfPasswordsDoNotMatch(password, passwordConfirmation);

    const user = await failIfUserNotFound(email);
    const pinRecord = await getVerificationPinByUserId(user.id);

    failIfPinInvalid(pinRecord, pinCode);

    const passwordHash = await bcrypt.hash(password, 12);
    await verifyUserAndSetPassword(user.id, passwordHash);

    return {
        message: "Email verified successfully",
        verified: true
    };
};

function failIfUserIsNotVerified(user) {
    if (!user.isVerified) {
        const error = new Error("Email address has not been verified. Please check your email for the verification PIN.");
        error.statusCode = 403;
        throw error;
    }
}

function failIfCredentialsInvalid() {
    const error = new Error("Invalid email or password. Please check your credentials and try again.");
    error.statusCode = 401;
    throw error;
}

const generateSessionToken = () =>
    crypto.randomBytes(SESSION_TOKEN_BYTES).toString("hex");

const generateResetToken = () =>
    crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");

export const loginUser = async ({ email, password }) => {
    const user = await getUserByEmail(email);
    if (!user) {
        failIfCredentialsInvalid();
    }

    failIfUserIsNotVerified(user);

    const hasPasswordHash = Boolean(user.passwordHash) && user.passwordHash !== "PENDING";
    if (!hasPasswordHash) {
        failIfCredentialsInvalid();
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
        failIfCredentialsInvalid();
    }

    await deleteSessionsByUserId(user.id);

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await createSession({
        userId: user.id,
        sessionToken,
        expiresAt
    });

    return {
        userId: user.id,
        sessionToken,
        expiresAt,
        cookieName: SESSION_COOKIE_NAME
    };
};

export const logoutUser = async (sessionToken) => {
    if (!sessionToken) return;
    await deleteSessionByToken(sessionToken);
};

export const requestPasswordReset = async (email) => {
    const user = await getUserByEmail(email);
    if (!user) {
        const error = new Error("Not found.");
        error.statusCode = 404;
        throw error;
    }

    await deletePasswordResetTokensByUserId(user.id);

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await createPasswordResetToken({
        userId: user.id,
        token: resetToken,
        expiresAt
    });

    await enqueuePasswordResetEmail({ email, resetToken });

    return {
        message: "Password reset link has been sent to your email"
    };
};

function failIfResetTokenInvalid(tokenRecord) {
    if (!tokenRecord) {
        const error = new Error("Invalid or expired reset token. Please request a new password reset link.");
        error.statusCode = 400;
        throw error;
    }

    const isExpired = tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date();
    const isUsed = tokenRecord.used;

    if (isExpired || isUsed) {
        const error = new Error("Invalid or expired reset token. Please request a new password reset link.");
        error.statusCode = 400;
        throw error;
    }
}

export const confirmPasswordReset = async ({ token, newPassword, passwordConfirmation }) => {
    if (newPassword !== passwordConfirmation) {
        const error = new Error("Passwords do not match. Please ensure both password fields are identical.");
        error.statusCode = 400;
        throw error;
    }

    const tokenRecord = await getPasswordResetTokenRecord(token);
    failIfResetTokenInvalid(tokenRecord);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await resetPasswordAndVerifyUser({ userId: tokenRecord.userId, passwordHash });

    return {
        message: "Password reset successful"
    };
};