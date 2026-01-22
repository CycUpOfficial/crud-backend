import { deleteSessionByToken, getSessionByToken } from "../repositories/auth.repository.js";
import { parseCookies } from "../utils/cookieparser.js";

const PUBLIC_PATHS = new Set([
    "/health",
    "/auth/register",
    "/auth/verify",
    "/auth/login",
    "/auth/password/reset",
    "/auth/password/reset/confirm"
]);


function passIfRequestMethodIsOptions(req, next) {
    if (req.method === "OPTIONS") {
        next();
        return true;
    }
    return false;
}

function passIfRequestedResourceIsPublic(req, next) {
    if (PUBLIC_PATHS.has(req.path)) {
        next();
        return true;
    }
    return false;
}

function failIfNoSessionTokenIsSent(sessionToken, next) {
    if (!sessionToken) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        return next(error);
    }
}

async function failIfSessionIsNotValid(session, next) {
    if (!session) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        return next(error);
    }
}

async function failIfSessionHasExpired(session, sessionToken, next) {
    const isExpired = session.expiresAt && new Date(session.expiresAt) < new Date();
    if (isExpired) {
        await deleteSessionByToken(sessionToken);
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        return next(error);
    }
}

export const requireAuth = async (req, res, next) => {
    if (passIfRequestMethodIsOptions(req, next)) return;
    if (passIfRequestedResourceIsPublic(req, next)) return;

    const cookies = req.cookies ?? parseCookies(req.headers.cookie);
    const sessionToken = cookies?.session;

    failIfNoSessionTokenIsSent(sessionToken, next);

    const session = await getSessionByToken(sessionToken);
    await failIfSessionIsNotValid(session, next);
    await failIfSessionHasExpired(session, sessionToken, next);

    req.auth = {
        userId: session.userId,
        sessionToken
    };

    return next();
};