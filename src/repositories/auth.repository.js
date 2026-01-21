import { prisma } from "../db/index.js";

export const getUserByEmail = (email) =>
    prisma.user.findUnique({ where: { email } });

export const getVerificationPinByUserId = (userId) =>
    prisma.verificationPin.findUnique({ where: { userId } });

export const createUserWithVerificationPin = (email, pinCode, expiresAt) =>
    prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                passwordHash: "PENDING"
            }
        });

        await tx.verificationPin.create({
            data: {
                userId: user.id,
                pinCode,
                expiresAt
            }
        });

        return user;
    });

export const verifyUserAndSetPassword = (userId, passwordHash) =>
    prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: userId },
            data: { isVerified: true, passwordHash }
        });

        await tx.verificationPin.delete({
            where: { userId }
        });

        return user;
    });

export const createSession = ({ userId, sessionToken, expiresAt }) =>
    prisma.session.create({
        data: {
            userId,
            sessionToken,
            expiresAt
        }
    });

export const deleteSessionByToken = (sessionToken) =>
    prisma.session.deleteMany({
        where: { sessionToken }
    });

export const deleteSessionsByUserId = (userId) =>
    prisma.session.deleteMany({
        where: { userId }
    });