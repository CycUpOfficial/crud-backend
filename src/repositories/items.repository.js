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
