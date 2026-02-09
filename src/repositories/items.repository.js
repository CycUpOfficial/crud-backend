import {prisma} from "../db/index.js";

export const getUserForItemCreate = (userId) =>
    prisma.user.findUnique({
        where: {id: userId},
        select: {
            id: true,
            isVerified: true,
            isBlocked: true
        }
    });

export const getCategoryById = (categoryId) =>
    prisma.category.findUnique({
        where: {id: categoryId},
        select: {id: true, name: true}
    });

export const getCityById = (cityId) =>
    prisma.city.findUnique({
        where: {id: cityId},
        select: {id: true, name: true}
    });

export const createItemWithPhotos = (data) =>
    prisma.item.create({
        data,
        include: {
            category: {select: {id: true, name: true}},
            city: {select: {id: true, name: true}},
            photos: {select: {id: true, photoUrl: true, isMain: true, displayOrder: true}}
        }
    });

export const listItems = ({where, orderBy, skip, take}) =>
    prisma.item.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
            id: true,
            title: true,
            itemType: true,
            sellingPrice: true,
            lendingPrice: true,
            rentUnit: true,
            city: {select: {name: true}},
            photos: {
                where: {isMain: true},
                take: 1,
                select: {photoUrl: true, isMain: true}
            }
        }
    });

export const countItems = (where) =>
    prisma.item.count({where});

export const getItemById = (itemId) =>
    prisma.item.findUnique({
        where: {id: itemId},
        select: {
            id: true,
            ownerId: true,
            buyerId: true,
            status: true,
            isDisabledByAdmin: true,
            title: true,
            categoryId: true,
            brandName: true,
            condition: true,
            description: true,
            address: true,
            cityId: true,
            itemType: true,
            sellingPrice: true,
            lendingPrice: true,
            rentUnit: true,
            createdAt: true,
            updatedAt: true
        }
    });

export const getItemWithDetails = (itemId) =>
    prisma.item.findUnique({
        where: {id: itemId},
        include: {
            category: {select: {id: true, name: true}},
            city: {select: {id: true, name: true}},
            photos: {
                orderBy: {displayOrder: "asc"},
                select: {id: true, photoUrl: true, isMain: true, displayOrder: true}
            },
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    familyName: true,
                    email: true
                }
            }
        }
    });

export const updateItemById = (itemId, data) =>
    prisma.item.update({
        where: {id: itemId},
        data,
        include: {
            category: {select: {id: true, name: true}},
            city: {select: {id: true, name: true}},
            photos: {
                orderBy: {displayOrder: "asc"},
                select: {id: true, photoUrl: true, isMain: true, displayOrder: true}
            }
        }
    });

export const updateItemWithPhotos = (itemId, data, photos) =>
    prisma.item.update({
        where: {id: itemId},
        data: {
            ...data,
            photos: {
                deleteMany: {},
                create: photos
            }
        },
        include: {
            category: {select: {id: true, name: true}},
            city: {select: {id: true, name: true}},
            photos: {
                orderBy: {displayOrder: "asc"},
                select: {id: true, photoUrl: true, isMain: true, displayOrder: true}
            }
        }
    });

export const softDeleteItemById = (itemId) =>
    prisma.item.update({
        where: {id: itemId},
        data: {status: "deleted"}
    });

export const markItemAsSoldById = ({itemId, buyerId}) =>
    prisma.item.update({
        where: {id: itemId},
        data: {
            status: "sold",
            buyerId,
            soldAt: new Date()
        },
        include: {
            category: {select: {id: true, name: true}},
            city: {select: {id: true, name: true}},
            photos: {
                orderBy: {displayOrder: "asc"},
                select: {id: true, photoUrl: true, isMain: true, displayOrder: true}
            }
        }
    });
