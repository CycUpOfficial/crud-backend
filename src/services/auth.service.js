import { getUserByEmail, createUserWithVerificationPin } from "../repositories/auth.repository.js";

// REPLACED: Regex removed in favor of an allowlist
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

function failIfUserAlreadyExists(existingUser) {
    if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 400;
        throw error;
    }
}

export const registerUser = async (email) => {
    failIfEmailFormatIsInvalid(email);

    const existingUser = await getUserByEmail(email);
    failIfUserAlreadyExists(existingUser);

    const pinCode = generatePinCode();
    const expiresAt = new Date(Date.now() + PIN_EXPIRY_MINUTES * 60 * 1000);

    const user = await createUserWithVerificationPin(email, pinCode, expiresAt);

    return {
        message: "Registration successful. Please check your email for verification PIN.",
        userId: user.id
    };
};