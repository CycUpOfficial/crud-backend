import { submitRatingService } from "../services/ratings.service.js";

export const submitRatingController = async (req, res, next) => {
    try {
        const { itemId } = req.validated.params;
        const { rating, comment } = req.validated.body;

        const raterId = req.auth.userId;

        const result = await submitRatingService({
            itemId,
            raterId,
            rating,
            comment
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};
