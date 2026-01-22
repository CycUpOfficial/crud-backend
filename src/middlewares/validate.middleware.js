export const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        const firstIssue = result.error.issues?.[0];
        const message = firstIssue?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        return next(error);
    }

    req.validated = result.data;
    return next();
};