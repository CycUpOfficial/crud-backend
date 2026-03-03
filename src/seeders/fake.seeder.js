import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/index.js";

const buildToken = () => crypto.randomBytes(16).toString("hex");

// Helper function to create password hash (matching auth.service.js - roundness 12)
const hashPassword = async(password) => {
    return bcryptjs.hash(password, 12);
};

const getOrCreateUser = async({ email, username, isAdmin, isVerified, cityId, password }) => {
    const passwordHash = password ? await hashPassword(password) : "PENDING";

    return prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            username,
            passwordHash,
            isAdmin,
            isVerified,
            cityId
        }
    });
};

// ============================================================================
// TEST ACCOUNTS - Use these credentials to login and test the application:
// ============================================================================
// Account 1:
//   Email: danny.lafond@abo.fi
//   Password: Test1234
//   Username: danny_lafond
//   Role: Regular User (Seller)
//
// Account 2:
//   Email: sema.hoippa@utu.fi
//   Password: Test1234
//   Username: sema_hoippa
//   Role: Regular User (Buyer)
// ============================================================================

// call with { force: true } to clear existing fake records before inserting
export const seedFakeData = async({ force = false } = {}) => {
    if (force) {
        console.info("force seed enabled - clearing previous fake data");
        // delete in the correct order to satisfy FK constraints
        await prisma.$transaction([
            prisma.rating.deleteMany(),
            prisma.notification.deleteMany(),
            prisma.savedSearchTerm.deleteMany(),
            prisma.savedSearch.deleteMany(),
            prisma.report.deleteMany(),
            prisma.itemPhoto.deleteMany(),
            prisma.item.deleteMany(),
            prisma.session.deleteMany(),
            prisma.passwordResetToken.deleteMany(),
            prisma.verificationPin.deleteMany(),
            prisma.user.deleteMany({
                where: {
                    email: { in: [
                            "danny.lafond@abo.fi",
                            "sema.hoippa@utu.fi"
                        ]
                    }
                }
            })
        ]);
    }

    const [city, category] = await Promise.all([
        prisma.city.findFirst({ orderBy: { createdAt: "asc" } }),
        prisma.category.findFirst({ orderBy: { createdAt: "asc" } })
    ]);

    if (!city || !category) {
        throw new Error("Cities and categories must be seeded before fake data.");
    }

    // Create test users with known passwords (Test1234)
    const seller = await getOrCreateUser({
        email: "danny.lafond@abo.fi",
        username: "danny_lafond",
        isAdmin: false,
        isVerified: true,
        cityId: city.id,
        password: "Test1234"
    });

    const buyer = await getOrCreateUser({
        email: "sema.hoippa@utu.fi",
        username: "sema_hoippa",
        isAdmin: false,
        isVerified: true,
        cityId: city.id,
        password: "Test1234"
    });

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
                ownerId: buyer.id,
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

        const publishedItem = await prisma.item.create({
            data: {
                ownerId: seller.id,
                title: "Gaming Laptop",
                categoryId: category.id,
                condition: "used",
                description: "High-performance gaming laptop with RTX 3060, 16GB RAM. Perfect for students.",
                address: "Tech Building 7",
                cityId: city.id,
                itemType: "selling",
                sellingPrice: new Prisma.Decimal("450.00"),
                status: "published"
            }
        });

        await prisma.itemPhoto.createMany({
            data: [{
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
                },
                {
                    itemId: publishedItem.id,
                    photoUrl: "https://example.com/photos/gaming-laptop.jpg",
                    isMain: true,
                    displayOrder: 1
                }
            ]
        });

        // Create a rating for the sold item
        await prisma.rating.create({
            data: {
                itemId: soldItem.id,
                sellerId: seller.id,
                raterId: buyer.id,
                rating: 5,
                comment: "Great seller and item as described. Very professional!"
            }
        });

        // Create additional rating
        await prisma.rating.create({
            data: {
                itemId: publishedItem.id,
                sellerId: seller.id,
                raterId: buyer.id,
                rating: 4,
                comment: "Good condition, prompt communication."
            }
        });
    }

    const notificationCount = await prisma.notification.count();
    if (notificationCount === 0) {
        await prisma.notification.createMany({
            data: [{
                    userId: seller.id,
                    type: "rating_received",
                    title: "New rating received",
                    message: "You received a 5-star rating on your item 'Used Bicycle'.",
                    metadata: { itemTitle: "Used Bicycle", rating: 5 }
                },
                {
                    userId: seller.id,
                    type: "item_status_change",
                    title: "Item sold",
                    message: "Your item 'Used Bicycle' has been marked as sold.",
                    metadata: { itemTitle: "Used Bicycle", newStatus: "sold" }
                },
                {
                    userId: buyer.id,
                    type: "saved_search_match",
                    title: "New match found",
                    message: "A new item matching your saved search 'gaming' is available.",
                    metadata: { searchTerm: "gaming", itemTitle: "Gaming Laptop" }
                },
                {
                    userId: seller.id,
                    type: "rating_received",
                    title: "New rating",
                    message: "You received a 4-star rating on your item 'Gaming Laptop'.",
                    metadata: { itemTitle: "Gaming Laptop", rating: 4 }
                }
            ]
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
                        { searchTerm: "gaming" },
                        { searchTerm: "laptop" },
                        { searchTerm: "bicycle" }
                    ]
                }
            }
        });

        await prisma.savedSearchTerm.updateMany({
            where: { savedSearchId: savedSearch.id },
            data: { createdAt: new Date() }
        });

        // Create another saved search for seller
        await prisma.savedSearch.create({
            data: {
                userId: seller.id,
                emailEnabled: false,
                inAppEnabled: true,
                terms: {
                    create: [
                        { searchTerm: "electronics" },
                        { searchTerm: "gadgets" }
                    ]
                }
            }
        });
    }

    const reportCount = await prisma.report.count();
    if (reportCount === 0) {
        await prisma.report.create({
            data: {
                reporterId: buyer.id,
                reportedUserId: seller.id,
                description: "Item listing is missing some details.",
                status: "pending"
            }
        });
    }

    console.log("✓ Fake data seeded successfully!");
    console.log("\n📝 TEST CREDENTIALS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nSeller Account:");
    console.log("  Email: danny.lafond@abo.fi");
    console.log("  Password: Test1234");
    console.log("  Username: danny_lafond");
    console.log("\nBuyer Account:");
    console.log("  Email: sema.hoippa@utu.fi");
    console.log("  Password: Test1234");
    console.log("  Username: sema_hoippa");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};