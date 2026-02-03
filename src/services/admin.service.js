import { getAdminAnalytics } from "../repositories/admin.repository.js";
import { getAdminUsers } from "../repositories/admin.repository.js";
import { adminUserDto } from "../dtos/admin.dto.js";
import { getAdminReportsRepo } from "../repositories/admin.repository.js";
import { adminReportDto } from "../dtos/admin.dto.js";
import {
    findItemById,
    disableItemByAdmin,
    deleteItemByAdmin
} from "../repositories/admin.repository.js";
import { findUserById, blockUserById, unblockUserById } from "../repositories/admin.repository.js";
import { createAdminReport } from "../repositories/admin.repository.js";

export const fetchAdminAnalytics = async () => {
    return getAdminAnalytics();
};


export const fetchAdminUsers = async ({ search, page, limit }) => {
    const { users, total } = await getAdminUsers({ search, page, limit });

    return {
        users: users.map(adminUserDto),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const fetchAdminReports = async ({ startDate, endDate, page, limit }) => {
    const { reports, total } = await getAdminReportsRepo({
        startDate,
        endDate,
        page,
        limit
    });

    return {
        reports: reports.map(adminReportDto),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const disableAdminItem = async (itemId) => {
    const item = await findItemById(itemId);

    if (!item) {
        const error = new Error(`Given itemId ${itemId} does not exist!`);
        error.statusCode = 402;
        throw error;
    }

    if (item.isDisabledByAdmin) {
        return; // already disabled, idempotent
    }

    await disableItemByAdmin(itemId);
};

export const removeAdminItem = async (itemId) => {
    const item = await findItemById(itemId);

    if (!item) {
        const error = new Error(`Given itemId ${itemId} does not exist!`);
        error.statusCode = 402;
        throw error;
    }

    await deleteItemByAdmin(itemId);
};

export const blockAdminUser = async ({ userId, reason }) => {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error("user not exist");
        error.statusCode = 405;
        throw error;
    }

    // Optional safety: prevent blocking admins
    // If you want this rule, uncomment:
    // if (user.isAdmin) {
    //     const error = new Error("Not authorized to take this action.");
    //     error.statusCode = 403;
    //     throw error;
    // }

    await blockUserById({ userId, reason });
};

export const unblockAdminUser = async (userId) => {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error("user not exist");
        error.statusCode = 405;
        throw error;
    }

    await unblockUserById(userId);
};



export const submitAdminReport = async ({ adminUserId, userId, description }) => {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error("User not exist!");
        error.statusCode = 404;
        throw error;
    }

    const report = await createAdminReport({
        reporterId: adminUserId,
        reportedUserId: userId,
        description
    });

    return { reportId: report.id };
};




