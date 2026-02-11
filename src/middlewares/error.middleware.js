import { logError } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    const status = err.statusCode ?? 500;
    const message = err.message ?? "Internal Server Error";

    logError(err, req);

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
        res.status(status).json({
            message,
            details: err.details ?? undefined
        });
    }
    else{
        res.status(status).json({
            message,
            details: "An unexpected Error happened in the system." ?? undefined
        });
    }

};