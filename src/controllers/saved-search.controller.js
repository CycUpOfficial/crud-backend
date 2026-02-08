import { createSavedSearchService } from "../services/saved-search.service.js";
import { toCreateSavedSearchResponseDto } from "../dtos/saved-search.dto.js";
import { getSavedSearchesService } from "../services/saved-search.service.js";
import { toSavedSearchDto } from "../dtos/saved-search.dto.js";
import { updateSavedSearchService, deleteSavedSearchService } from "../services/saved-search.service.js";
import { toSavedSearchResponseDto } from "../dtos/saved-search.dto.js";

export const createSavedSearchController = async (req, res) => {
    const userId = req.auth.userId;
    const { searchTerms, email, in_app } = req.validated.body;

    const savedSearch = await createSavedSearchService({
        userId,
        searchTerms,
        email,
        in_app
    });

    res.status(201).json(toCreateSavedSearchResponseDto(savedSearch));
};

export const getSavedSearchesController = async (req, res) => {
    const userId = req.auth.userId;

    const savedSearches = await getSavedSearchesService(userId);

    res.status(200).json({
        message: "Saved searches retrieved successfully",
        savedSearches: savedSearches.map(toSavedSearchDto)
    });
};

export const updateSavedSearchController = async (req, res) => {
    const userId = req.auth.userId;
    const { searchId } = req.validated.params;
    const { searchTerms, email, in_app } = req.validated.body;

    const updated = await updateSavedSearchService({
        userId,
        searchId,
        searchTerms,
        email,
        in_app
    });

    res.status(200).json({
        message: "Saved search updated successfully!",
        ...toSavedSearchResponseDto(updated)
    });
};

export const deleteSavedSearchController = async (req, res) => {
    const userId = req.auth.userId;
    const { searchId } = req.validated.params;

    await deleteSavedSearchService({ userId, searchId });

    res.status(200).json({
        message: "Saved search deleted successfully!"
    });
};
