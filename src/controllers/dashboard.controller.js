import {
    getDashboardAnalytics,
    getDashboardItems,
    getDashboardRatings
} from "../services/dashboard.service.js";
import {
    buildDashboardAnalyticsDto,
    buildDashboardItemsDto,
    buildDashboardRatingsDto
} from "../dtos/dashboard.dto.js";

export const dashboardAnalytics = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        const data = await getDashboardAnalytics(userId);

        res.json(buildDashboardAnalyticsDto(data));
    } catch (error) {
        next(error);
    }
};

export const dashboardItems = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { status, page, limit } = req.validated.query;

        const data = await getDashboardItems({
            userId,
            status,
            page,
            limit
        });

        res.json(buildDashboardItemsDto(data));
    } catch (error) {
        next(error);
    }
};

export const dashboardRatings = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        const data = await getDashboardRatings(userId);

        res.json(buildDashboardRatingsDto(data));
    } catch (error) {
        next(error);
    }
};
