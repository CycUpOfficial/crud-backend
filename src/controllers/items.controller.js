import { parseMultipleFiles, saveImages } from "../storage/storage.service.js";
import { createItemSchema, updateItemSchema } from "../validators/items.validator.js";
import {
    createItem as createItemService,
    listItems as listItemsService,
    getItemDetails as getItemDetailsService,
    updateItem as updateItemService,
    deleteItem as deleteItemService,
    markItemAsSold as markItemAsSoldService
} from "../services/items.service.js";
import { toItemDetailResponseDto, toItemResponseDto, toItemsListResponseDto } from "../dtos/items.dto.js";

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

const ensureUpdatePhotosValid = ({ files, mainPhotoIndex }) => {
    if (files?.length) {
        if (mainPhotoIndex === undefined || mainPhotoIndex === null) {
            const error = new Error("mainPhotoIndex is required when photos are provided.");
            error.statusCode = 400;
            throw error;
        }

        if (mainPhotoIndex < 0 || mainPhotoIndex >= files.length) {
            const error = new Error("mainPhotoIndex is out of range.");
            error.statusCode = 400;
            throw error;
        }
    } else if (mainPhotoIndex !== undefined && mainPhotoIndex !== null) {
        const error = new Error("mainPhotoIndex cannot be provided without photos.");
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

    const hasFieldUpdates = [
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
    ].some((value) => value !== undefined);

    if (!hasFieldUpdates && !files?.length) {
        const error = new Error("No update fields provided.");
        error.statusCode = 400;
        throw error;
    }

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

export const getItemById = async (req, res) => {
    const { itemId } = req.validated?.params ?? {};
    const item = await getItemDetailsService({ itemId });

    res.status(200).json(toItemDetailResponseDto(item, req));
};

export const updateItem = async (req, res) => {
    const { body, files } = await parseMultipleFiles({
        req,
        res,
        fieldName: "photos",
        maxFiles: 3,
        allowedMimeTypes: ["image/jpeg", "image/png"],
        maxFileSize: 3 * 1024 * 1024
    });

    const result = updateItemSchema.safeParse({
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

    ensureUpdatePhotosValid({ files, mainPhotoIndex });

    const uploadedPhotos = files?.length
        ? await saveImages({ files, folder: "item-images" })
        : [];

    const photos = uploadedPhotos.map((photo, index) => ({
        photoUrl: photo.url,
        isMain: index === mainPhotoIndex,
        displayOrder: index
    }));

    const item = await updateItemService({
        itemId: result.data.params.itemId,
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
        photos: photos.length ? photos : undefined
    });

    res.status(200).json(toItemResponseDto(item, req));
};

export const deleteItem = async (req, res) => {
    const { itemId } = req.validated?.params ?? {};
    await deleteItemService({ itemId, userId: req.auth.userId });

    res.status(200).json({ message: "Item deleted successfully" });
};

export const markItemAsSold = async (req, res) => {
    const { buyerEmail } = req.validated?.body ?? {};
    const { itemId } = req.validated?.params ?? {};

    const item = await markItemAsSoldService({
        itemId,
        userId: req.auth.userId,
        buyerEmail
    });

    res.status(200).json(toItemResponseDto(item, req));
};
