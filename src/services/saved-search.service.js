import { createSavedSearch } from "../repositories/saved-search.repository.js";
import { getSavedSearchesByUserId } from "../repositories/saved-search.repository.js";
import {
    getSavedSearchByIdForUser,
    updateSavedSearchSettings,
    updateSavedSearchTerm,
    deleteSavedSearchByIdForUser
} from "../repositories/saved-search.repository.js";

export const createSavedSearchService = async ({
                                                   userId,
                                                   searchTerms,
                                                   email,
                                                   in_app
                                               }) => {
    // Business: one keyword at a time (validator enforces max(1), but keep safety)
    const searchTerm = searchTerms?.[0];

    if (!searchTerm) {
        const error = new Error("Invalid input!");
        error.statusCode = 400;
        throw error;
    }

    const savedSearch = await createSavedSearch({
        userId,
        emailEnabled: Boolean(email),
        inAppEnabled: Boolean(in_app),
        searchTerm
    });

    return savedSearch;
};

export const getSavedSearchesService = async (userId) => {
    return getSavedSearchesByUserId(userId);
};

export const updateSavedSearchService = async ({ userId, searchId, searchTerms, email, in_app }) => {
    const savedSearch = await getSavedSearchByIdForUser({ searchId, userId });

    if (!savedSearch) {
        const error = new Error("Saved search not found");
        error.statusCode = 404;
        throw error;
    }

    // Update notification flags if provided
    const emailEnabled = email !== undefined ? Boolean(email) : undefined;
    const inAppEnabled = in_app !== undefined ? Boolean(in_app) : undefined;

    if (emailEnabled !== undefined || inAppEnabled !== undefined) {
        await updateSavedSearchSettings({
            searchId,
            userId,
            emailEnabled,
            inAppEnabled
        });
    }

    // Update term if provided (only 1 keyword allowed)
    if (searchTerms !== undefined) {
        const newTerm = searchTerms?.[0];

        if (!newTerm) {
            const error = new Error("Invalid input!");
            error.statusCode = 400;
            throw error;
        }

        const existingTerm = savedSearch.terms?.[0];
        if (existingTerm) {
            await updateSavedSearchTerm({ termId: existingTerm.id, searchTerm: newTerm });
        } else {
            // Very unlikely, but safety: if no terms exist, treat as invalid state
            const error = new Error("Saved search not found");
            error.statusCode = 404;
            throw error;
        }
    }

    // Return latest state
    const updated = await getSavedSearchByIdForUser({ searchId, userId });

    return updated;
};

export const deleteSavedSearchService = async ({ userId, searchId }) => {
    const result = await deleteSavedSearchByIdForUser({ userId, searchId });

    if (!result || result.count === 0) {
        const error = new Error("Saved-search not found!");
        error.statusCode = 404;
        throw error;
    }
};
