const buildFileUrl = (req, fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return fileUrl;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    if (fileUrl.startsWith("/")) {
        return `${baseUrl}${fileUrl}`;
    }
    return `${baseUrl}/${fileUrl}`;
};

export const toItemResponseDto = (item, req) => ({
    id: item.id,
    title: item.title,
    categoryId: item.categoryId,
    category: item.category?.name ?? null,
    brandName: item.brandName,
    condition: item.condition,
    description: item.description,
    address: item.address,
    cityId: item.cityId,
    city: item.city?.name ?? null,
    itemType: item.itemType,
    sellingPrice: item.sellingPrice,
    lendingPrice: item.lendingPrice,
    rentUnit: item.rentUnit,
    photos: (item.photos ?? []).map((photo) => ({
        url: buildFileUrl(req, photo.photoUrl),
        isMain: photo.isMain
    })),
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
});

export const toItemSummaryDto = (item, req) => ({
    id: item.id,
    title: item.title,
    mainImage: buildFileUrl(req, item.photos?.[0]?.photoUrl ?? null),
    sellingPrice: item.sellingPrice,
    lendingPrice: item.lendingPrice,
    itemType: item.itemType
});

export const toItemsListResponseDto = ({ items, pagination }, req) => ({
    items: items.map((item) => toItemSummaryDto(item, req)),
    pagination
});
