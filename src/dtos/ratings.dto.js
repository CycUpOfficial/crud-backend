export const validateCreateRatingDto = (body) => {
    const { rating, comment } = body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        const err = new Error("Rating must be between 1 and 5.");
        err.status = 400;
        throw err;
    }

    if (comment && typeof comment !== "string") {
        const err = new Error("Invalid comment.");
        err.status = 400;
        throw err;
    }

    return { rating, comment };
};