import { parseMultipleFiles, saveImages } from "../storage/storage.service.js";
import { createItemSchema } from "../validators/items.validator.js";
import { createItem as createItemService, listItems as listItemsService } from "../services/items.service.js";
import { toItemResponseDto, toItemsListResponseDto } from "../dtos/items.dto.js";

const ensurePhotosValid = ({ files, mainPhotoIndex }) => {
    if (!files || files.length === 0) {
        const error = new Error("At least one photo is required.");
        error.statusCode = 400;
        throw error;
    }

    if (mainPhotoIndex === undefined || mainPhotoIndex === null) {
        const error = new Error("mainPhotoIndex is required.");
        error.statusCode = 400;
        throw error;
    }

    if (mainPhotoIndex < 0 || mainPhotoIndex >= files.length) {
        const error = new Error("mainPhotoIndex is out of range.");
        error.statusCode = 400;
        throw error;
    }
};

export const createItem = async (req, res) => {
    const { body, files } = await parseMultipleFiles({
        req,
        res,
        fieldName: "photos",
        maxFiles: 3,
        allowedMimeTypes: ["image/jpeg", "image/png"],
        maxFileSize: 3 * 1024 * 1024
    });

    const result = createItemSchema.safeParse({
        body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        const firstIssue = result.error.issues?.[0];
        const message = firstIssue?.message ?? "Validation error";
        const error = new Error(message);
        error.statusCode = 400;
        error.details = result.error.flatten();
        throw error;
    }

    const {
        title,
        categoryId,
        brandName,
        condition,
        description,
        address,
        cityId,
        itemType,
        sellingPrice,
        lendingPrice,
        rentUnit,
        mainPhotoIndex
    } = result.data.body;

    ensurePhotosValid({ files, mainPhotoIndex });

    const uploadedPhotos = await saveImages({ files, folder: "item-images" });
    const photos = uploadedPhotos.map((photo, index) => ({
        photoUrl: photo.url,
        isMain: index === mainPhotoIndex,
        displayOrder: index
    }));

    const item = await createItemService({
        userId: req.auth.userId,
        title,
        categoryId,
        brandName,
        condition,
        description,
        address,
        cityId,
        itemType,
        sellingPrice,
        lendingPrice,
        rentUnit,
        photos
    });

    res.status(201).json(toItemResponseDto(item, req));
};

export const listItems = async (req, res) => {
    const {
        search,
        city,
        itemType,
        condition,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        page,
        limit
    } = req.validated?.query ?? {};

    const response = await listItemsService({
        search,
        city,
        itemType,
        condition,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        page,
        limit
    });

    res.status(200).json(toItemsListResponseDto(response, req));
};
