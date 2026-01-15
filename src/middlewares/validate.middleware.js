export const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        const error = new Error("Validation error");
        error.statusCode = 400;
        error.details = result.error.flatten();
        return next(error);
    }

    req.validated = result.data;
    return next();
};