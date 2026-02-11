import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/index.js";

const buildToken = () => crypto.randomBytes(16).toString("hex");

const getOrCreateUser = async ({ email, username, isAdmin, isVerified, cityId }) =>
    prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            username,
            passwordHash: "HASHED",
            isAdmin,
            isVerified,
            cityId
        }
    });

export const seedFakeData = async () => {
    const [city, category] = await Promise.all([
        prisma.city.findFirst({ orderBy: { createdAt: "asc" } }),
        prisma.category.findFirst({ orderBy: { createdAt: "asc" } })
    ]);

    if (!city || !category) {
        throw new Error("Cities and categories must be seeded before fake data.");
    }

    const admin = await getOrCreateUser({
        email: "admin@abo.fi",
        username: "admin",
        isAdmin: true,
        isVerified: true,
        cityId: city.id
    });

    const seller = await getOrCreateUser({
        email: "seller@utu.fi",
        username: "seller1",
        isAdmin: false,
        isVerified: true,
        cityId: city.id
    });

    const buyer = await getOrCreateUser({
        email: "buyer@abo.fi",
        username: "buyer1",
        isAdmin: false,
        isVerified: true,
        cityId: city.id
    });

    const pendingUser = await getOrCreateUser({
        email: "pending@utu.fi",
        username: "pending",
        isAdmin: false,
        isVerified: false,
        cityId: city.id
    });

    const verificationPin = await prisma.verificationPin.findFirst({
        where: { userId: pendingUser.id }
    });
    if (!verificationPin) {
        await prisma.verificationPin.create({
            data: {
                userId: pendingUser.id,
                pinCode: "123456",
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.findFirst({
        where: { userId: seller.id }
    });
    if (!passwordResetToken) {
        await prisma.passwordResetToken.create({
            data: {
                userId: seller.id,
                token: buildToken(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                used: false
            }
        });
    }

    const session = await prisma.session.findFirst({ where: { userId: admin.id } });
    if (!session) {
        await prisma.session.create({
            data: {
                userId: admin.id,
                sessionToken: buildToken(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
    }

    const itemCount = await prisma.item.count();
    if (itemCount === 0) {
        const soldItem = await prisma.item.create({
            data: {
                ownerId: seller.id,
                buyerId: buyer.id,
                title: "Used Bicycle",
                categoryId: category.id,
                condition: "used",
                description: "A reliable used bicycle for campus commuting.",
                address: "Campus Ave 12",
                cityId: city.id,
                itemType: "selling",
                sellingPrice: new Prisma.Decimal("120.00"),
                status: "sold",
                soldAt: new Date()
            }
        });

        const lendingItem = await prisma.item.create({
            data: {
                ownerId: seller.id,
                title: "Laptop for rent",
                categoryId: category.id,
                condition: "used",
                description: "Lightweight laptop available for short-term lending.",
                address: "Library Street 3",
                cityId: city.id,
                itemType: "lending",
                lendingPrice: new Prisma.Decimal("8.00"),
                rentUnit: "day",
                status: "published"
            }
        });

        const giveawayItem = await prisma.item.create({
            data: {
                ownerId: admin.id,
                title: "Desk Lamp",
                categoryId: category.id,
                condition: "used",
                description: "Free desk lamp in good condition.",
                address: "Student Housing 5",
                cityId: city.id,
                itemType: "giveaway",
                status: "published"
            }
        });

        await prisma.itemPhoto.createMany({
            data: [
                {
                    itemId: soldItem.id,
                    photoUrl: "https://example.com/photos/bike.jpg",
                    isMain: true,
                    displayOrder: 1
                },
                {
                    itemId: lendingItem.id,
                    photoUrl: "https://example.com/photos/laptop.jpg",
                    isMain: true,
                    displayOrder: 1
                },
                {
                    itemId: giveawayItem.id,
                    photoUrl: "https://example.com/photos/lamp.jpg",
                    isMain: true,
                    displayOrder: 1
                }
            ]
        });

        await prisma.rating.create({
            data: {
                itemId: soldItem.id,
                sellerId: seller.id,
                raterId: buyer.id,
                rating: 5,
                comment: "Great seller and item as described."
            }
        });
    }

    const notificationCount = await prisma.notification.count();
    if (notificationCount === 0) {
        await prisma.notification.create({
            data: {
                userId: seller.id,
                type: "rating_received",
                title: "New rating received",
                message: "You received a new rating on your item.",
                metadata: { itemTitle: "Used Bicycle" }
            }
        });
    }

    const savedSearchCount = await prisma.savedSearch.count();
    if (savedSearchCount === 0) {
        const savedSearch = await prisma.savedSearch.create({
            data: {
                userId: buyer.id,
                emailEnabled: true,
                inAppEnabled: true,
                terms: {
                    create: [
                        { searchTerm: "bicycle" },
                        { searchTerm: "laptop" }
                    ]
                }
            }
        });

        await prisma.savedSearchTerm.updateMany({
            where: { savedSearchId: savedSearch.id },
            data: { createdAt: new Date() }
        });
    }

    const reportCount = await prisma.report.count();
    if (reportCount === 0) {
        await prisma.report.create({
            data: {
                reporterId: buyer.id,
                reportedUserId: seller.id,
                description: "Item listing had missing details.",
                status: "pending"
            }
        });
    }
};
