import { prisma } from "../db/index.js";

export const getUserByEmail = (email) =>
    prisma.user.findUnique({ where: { email } });

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