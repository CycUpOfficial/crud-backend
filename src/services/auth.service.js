import bcrypt from "bcryptjs";
import {
    getUserByEmail,
    createUserWithVerificationPin,
    getVerificationPinByUserId,
    verifyUserAndSetPassword
} from "../repositories/auth.repository.js";
import { enqueueVerificationEmail } from "../queues/email.queue.js";

const TRUSTED_UNIVERSITY_DOMAINS = [
    "abo.fi",
    "utu.fi"
];

const PIN_LENGTH = 6;
const PIN_EXPIRY_MINUTES = 15;

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