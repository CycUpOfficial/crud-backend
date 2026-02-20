import rateLimit from "express-rate-limit";

/**
 * Common JSON response used by all limiters.
 * Express-rate-limit sends the response directly with HTTP 429.
 */
const rateLimitResponse = {
    message: "Too many requests. Please try again later."
};

/**
 * Auth endpoints: prevent brute force and spam.
 * Keyed by IP (works before login).
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse
});

/**
 * Read endpoints: dashboard, notifications, lists.
 */
export const readLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse
});

/**
 * Write endpoints: create/update/delete.
 */
export const writeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 writes per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse
});

/**
 * Admin destructive actions: stricter.
 */
export const adminDangerLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse
});