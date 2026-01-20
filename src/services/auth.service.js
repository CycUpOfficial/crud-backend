import {getUserByEmail, createUserWithVerificationPin} from "../repositories/auth.repository.js";
import {enqueueVerificationEmail} from "../queues/email.queue.js";

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