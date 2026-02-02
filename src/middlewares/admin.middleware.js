import { prisma } from "../db/index.js";

export const requireAdmin = async (req, res, next) => {
    if (!req.auth?.userId) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 401;
        return next(error);
    }

    const user = await prisma.user.findUnique({
        where: { id: req.auth.userId },
        select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
        const error = new Error("Not authorized to take this action.");
        error.statusCode = 403;
        return next(error);
    }

    return next();
};