import { prisma } from "../db/index.js";

export const getUserProfileById = (userId) =>
    prisma.user.findUnique({
        where: { id: userId },
        include: { city: true }
    });

export const getUserByUsername = (username) =>
    prisma.user.findFirst({
        where: {
            username: { equals: username, mode: "insensitive" }
        }
    });

export const updateUserProfileById = (userId, data) =>
    prisma.user.update({
        where: { id: userId },
        data,
        include: { city: true }
    });

export const getCityByName = (name) =>
    prisma.city.findFirst({
        where: {
            name: { equals: name, mode: "insensitive" }
        }
    });
