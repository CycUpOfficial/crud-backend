import { fetchAdminAnalytics } from "../services/admin.service.js";
import { fetchAdminUsers } from "../services/admin.service.js";
import { fetchAdminReports } from "../services/admin.service.js";
import {
    disableAdminItem,
    removeAdminItem
} from "../services/admin.service.js";
import { blockAdminUser } from "../services/admin.service.js";
import { unblockAdminUser } from "../services/admin.service.js";
import { submitAdminReport } from "../services/admin.service.js";

export const getAdminAnalyticsController = async (req, res) => {
    const analytics = await fetchAdminAnalytics();

    res.status(200).json(analytics);
};


export const getAdminUsersController = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        const result = await fetchAdminUsers({ search, page: Number(page), limit: Number(limit) });

        res.status(200).json({
            message: "Users retrieved successfully",
            ...result
        });
    } catch (error) {
        res.status(404).json({message: "User Not Found"});
    }

};


export const getAdminReports = async (req, res, next) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;

        const data = await fetchAdminReports({
            startDate,
            endDate,
            page: Number(page),
            limit: Number(limit)
        });

        res.status(200).json({
            message: "Reports retrieved successfully",
            ...data
        });
    } catch (error) {
        next(error);
    }
};

export const disableAdminItemController = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        await disableAdminItem(itemId);

        res.status(200).json({
            message: "Item disabled successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const removeAdminItemController = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        await removeAdminItem(itemId);

        res.status(200).json({
            message: "Item removed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const blockAdminUserController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.validated.body;

        await blockAdminUser({ userId, reason });

        res.status(200).json({
            message: "User blocked successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const unblockAdminUserController = async (req, res, next) => {
    try {
        const { userId } = req.params;

        await unblockAdminUser(userId);

        res.status(200).json({
            message: "User unblocked successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const submitAdminReportController = async (req, res, next) => {
    try {
        const { userId, description } = req.validated.body;
        const adminUserId = req.auth.userId;

        const result = await submitAdminReport({
            adminUserId,
            userId,
            description
        });

        res.status(200).json({
            message: "Report submitted successfully",
            reportId: result.reportId
        });
    } catch (error) {
        next(error);
    }
};



