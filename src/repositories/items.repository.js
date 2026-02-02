import { prisma } from "../db/index.js";

export const getUserForItemCreate = (userId) =>
    prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            isVerified: true,
            isBlocked: true
        }
    });

export const getCategoryById = (categoryId) =>
    prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true }
    });

export const getCityById = (cityId) =>
    prisma.city.findUnique({
        where: { id: cityId },
        select: { id: true, name: true }
    });

export const createItemWithPhotos = (data) =>
    prisma.item.create({
        data,
        include: {
            category: { select: { id: true, name: true } },
            city: { select: { id: true, name: true } },
            photos: { select: { id: true, photoUrl: true, isMain: true, displayOrder: true } }
        }
    });
