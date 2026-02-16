import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/index.js";

const buildToken = () => crypto.randomBytes(16).toString("hex");

// Helper to create users
const createUser = async({ email, username, isAdmin, isVerified, cityId, firstName, familyName, phoneNumber, profileImageUrl }) => {
    return prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            username,
            passwordHash: "HASHED",
            isAdmin,
            isVerified,
            cityId,
            firstName,
            familyName,
            phoneNumber,
            profileImageUrl
        }
    });
};

// Sample item data for variety
const ITEM_TEMPLATES = [{
        title: "Gaming Laptop",
        description: "High-performance gaming laptop, perfect for students. RTX 3060, 16GB RAM, 512GB SSD. Recently upgraded.",
        brandName: "ASUS",
        condition: "used",
        itemType: "selling",
        sellingPrice: "450.00",
        photos: [
            "https://images.unsplash.com/photo-1588405348159-ba1e6db64b8f?w=400",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
        ]
    },
    {
        title: "Mountain Bike",
        description: "Trek mountain bike, great for weekend trips. Recently serviced, new tires.",
        brandName: "Trek",
        condition: "used",
        itemType: "selling",
        sellingPrice: "200.00",
        photos: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
        ]
    },
    {
        title: "Coffee Maker",
        description: "Delonghi espresso machine, works perfectly. Includes accessories.",
        brandName: "Delonghi",
        condition: "used",
        itemType: "selling",
        sellingPrice: "75.00",
        photos: [
            "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400"
        ]
    },
    {
        title: "Projector Rental",
        description: "Full HD projector available for rent. Perfect for presentations and events.",
        brandName: "Epson",
        condition: "new",
        itemType: "lending",
        lendingPrice: "25.00",
        rentUnit: "day",
        photos: [
            "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400"
        ]
    },
    {
        title: "Camera Lens",
        description: "Professional camera lens for rent. 24-70mm f/2.8.",
        brandName: "Canon",
        condition: "new",
        itemType: "lending",
        lendingPrice: "15.00",
        rentUnit: "day",
        photos: [
            "https://images.unsplash.com/photo-1606986628253-05620e9b0a80?w=400"
        ]
    },
    {
        title: "Garden Tools Set",
        description: "Free garden tools set. Shovel, rake, hoe and more. Must pickup.",
        brandName: null,
        condition: "used",
        itemType: "giveaway",
        photos: [
            "https://images.unsplash.com/photo-1577654445533-6f8832b94a81?w=400"
        ]
    },
    {
        title: "Textbooks Bundle",
        description: "Free textbooks for computer science students. No longer needed.",
        brandName: null,
        condition: "used",
        itemType: "giveaway",
        photos: [
            "https://images.unsplash.com/photo-1543002588-d83cea6baa2b?w=400"
        ]
    },
    {
        title: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker, great sound quality. JBL brand.",
        brandName: "JBL",
        condition: "used",
        itemType: "selling",
        sellingPrice: "45.00",
        photos: [
            "https://images.unsplash.com/photo-1589003077984-894e133da19d?w=400"
        ]
    },
    {
        title: "Desk Chair",
        description: "Ergonomic office chair, adjustable height. Good condition.",
        brandName: "IKEA",
        condition: "used",
        itemType: "selling",
        sellingPrice: "80.00",
        photos: [
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400"
        ]
    },
    {
        title: "Vintage Bookshelf",
        description: "Wooden vintage bookshelf, solid wood. 180cm height.",
        brandName: null,
        condition: "used",
        itemType: "selling",
        sellingPrice: "120.00",
        photos: [
            "https://images.unsplash.com/photo-1507842217343-583f20270557?w=400"
        ]
    }
];

const COMMENTS = [
    "Excellent condition, exactly as described!",
    "Great seller, very responsive and professional.",
    "Perfect item, highly recommend!",
    "Item arrived quickly, very happy with the purchase.",
    "Good quality, seller communicated well.",
    "Fast delivery and good condition.",
    "Would buy from this seller again!",
    "Exactly what I needed, thanks!",
    "Good price, item works great.",
    "Reliable seller, smooth transaction."
];

const NOTIFICATION_MESSAGES = [
    { type: "item_status_change", title: "Item sold", message: "Your item 'Gaming Laptop' has been marked as sold." },
    { type: "item_status_change", title: "Item expired", message: "Your item 'Mountain Bike' listing has expired." },
    { type: "saved_search_match", title: "New match found", message: "A new item matching your saved search 'electronics' is available." },
    { type: "rating_received", title: "New rating received", message: "You received a 5-star rating on your item." },
    { type: "saved_search_match", title: "Search alert", message: "New item 'Coffee Maker' matches your saved search." },
];

export const seedExtendedFakeData = async() => {
    // Get existing base data
    const cities = await prisma.city.findMany({ orderBy: { createdAt: "asc" }, take: 5 });
    const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" }, take: 5 });

    if (cities.length === 0 || categories.length === 0) {
        throw new Error("Cities and categories must be seeded before extended fake data.");
    }

    const city1 = cities[0];
    const city2 = cities[1];
    const category1 = categories[0];
    const category2 = categories[1];

    // Create diverse user accounts for testing
    const sellers = await Promise.all([
        createUser({
            email: "seller2@example.com",
            username: "tech_seller",
            firstName: "John",
            familyName: "Smith",
            phoneNumber: "+358401234567",
            isAdmin: false,
            isVerified: true,
            cityId: city1.id,
            profileImageUrl: "https://i.pravatar.cc/150?img=1"
        }),
        createUser({
            email: "seller3@example.com",
            username: "bike_enthusiast",
            firstName: "Maria",
            familyName: "Garcia",
            phoneNumber: "+358401234568",
            isAdmin: false,
            isVerified: true,
            cityId: city2.id,
            profileImageUrl: "https://i.pravatar.cc/150?img=2"
        }),
        createUser({
            email: "seller4@example.com",
            username: "home_goods",
            firstName: "Alex",
            familyName: "Volkov",
            phoneNumber: "+358401234569",
            isAdmin: false,
            isVerified: true,
            cityId: city1.id,
            profileImageUrl: "https://i.pravatar.cc/150?img=3"
        })
    ]);

    const buyers = await Promise.all([
        createUser({
            email: "buyer2@example.com",
            username: "student_buyer",
            firstName: "Emma",
            familyName: "Johnson",
            phoneNumber: "+358401234570",
            isAdmin: false,
            isVerified: true,
            cityId: city1.id,
            profileImageUrl: "https://i.pravatar.cc/150?img=4"
        }),
        createUser({
            email: "buyer3@example.com",
            username: "casual_shopper",
            firstName: "David",
            familyName: "Chen",
            phoneNumber: "+358401234571",
            isAdmin: false,
            isVerified: true,
            cityId: city2.id,
            profileImageUrl: "https://i.pravatar.cc/150?img=5"
        }),
        createUser({
            email: "unverified@example.com",
            username: "new_user",
            firstName: "Sarah",
            familyName: "Wilson",
            isAdmin: false,
            isVerified: false,
            cityId: city1.id
        })
    ]);

    // Create a blocked user
    const blockedUser = await prisma.user.upsert({
        where: { email: "blocked@example.com" },
        update: {},
        create: {
            email: "blocked@example.com",
            username: "blocked_user",
            firstName: "Blocked",
            familyName: "User",
            passwordHash: "HASHED",
            isAdmin: false,
            isVerified: true,
            isBlocked: true,
            blockReason: "Suspicious activity",
            cityId: city1.id
        }
    });

    // Check existing items count
    const existingItemCount = await prisma.item.count();

    if (existingItemCount < 15) {
        const newItemsToCreate = ITEM_TEMPLATES.slice(0, 8);
        const statuses = ["published", "published", "published", "sold", "deleted", "expired", "published", "published"];

        for (let i = 0; i < newItemsToCreate.length; i++) {
            const template = newItemsToCreate[i];
            const seller = sellers[i % sellers.length];
            const shouldHaveBuyer = template.itemType === "selling" && statuses[i] === "sold";
            const buyer = shouldHaveBuyer ? buyers[0] : null;
            const status = statuses[i];

            const item = await prisma.item.create({
                data: {
                    ownerId: seller.id,
                    buyerId: (buyer && buyer.id) || null,
                    title: template.title,
                    categoryId: template.itemType === "lending" ? category1.id : category2.id,
                    brandName: template.brandName,
                    condition: template.condition,
                    description: template.description,
                    address: template.itemType === "giveaway" ? "Pickup location" : `${template.title} Location`,
                    cityId: i % 2 === 0 ? city1.id : city2.id,
                    itemType: template.itemType,
                    sellingPrice: template.sellingPrice ? new Prisma.Decimal(template.sellingPrice) : null,
                    lendingPrice: template.lendingPrice ? new Prisma.Decimal(template.lendingPrice) : null,
                    rentUnit: template.rentUnit || null,
                    status,
                    soldAt: status === "sold" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null
                }
            });

            // Add photos
            const photoData = template.photos.map((url, index) => ({
                itemId: item.id,
                photoUrl: url,
                isMain: index === 0,
                displayOrder: index + 1
            }));
            await prisma.itemPhoto.createMany({ data: photoData });

            // Add ratings for sold items
            if (status === "sold" && buyer) {
                const rating = Math.floor(Math.random() * 3) + 3;
                await prisma.rating.create({
                    data: {
                        itemId: item.id,
                        sellerId: seller.id,
                        raterId: buyer.id,
                        rating,
                        comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)]
                    }
                });
            }
        }
    }

    // Create varied notifications
    const notificationCount = await prisma.notification.count();
    if (notificationCount < 10) {
        const allUsers = [...sellers, ...buyers];
        const newNotifications = [];

        for (let i = 0; i < 8; i++) {
            const user = allUsers[i % allUsers.length];
            const notif = NOTIFICATION_MESSAGES[i % NOTIFICATION_MESSAGES.length];

            newNotifications.push({
                userId: user.id,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                metadata: { createdDaysAgo: Math.floor(Math.random() * 30) }
            });
        }

        await prisma.notification.createMany({
            data: newNotifications,
            skipDuplicates: true
        });
    }

    // Create more saved searches
    const savedSearchCount = await prisma.savedSearch.count();
    if (savedSearchCount < 5) {
        const saveSearchTerms = [
            ["laptop", "computer", "gaming"],
            ["bicycle", "bike", "cycling"],
            ["coffee", "kitchen", "appliances"],
            ["books", "textbooks", "study"]
        ];

        for (let i = 0; i < saveSearchTerms.length; i++) {
            const buyer = buyers[i % buyers.length];

            await prisma.savedSearch.create({
                data: {
                    userId: buyer.id,
                    emailEnabled: i % 2 === 0,
                    inAppEnabled: true,
                    terms: {
                        create: saveSearchTerms[i].map(term => ({ searchTerm: term }))
                    }
                }
            });
        }
    }

    // Create multiple reports
    const reportCount = await prisma.report.count();
    if (reportCount < 5) {
        const reports = [{
                reporterId: buyers[0].id,
                reportedUserId: sellers[0].id,
                description: "Suspicious seller behavior",
                status: "pending"
            },
            {
                reporterId: buyers[1].id,
                reportedUserId: sellers[1].id,
                description: "Item not as described",
                status: "reviewed"
            },
            {
                reporterId: buyers[2].id,
                reportedUserId: sellers[2].id,
                description: "Payment issue",
                status: "resolved"
            }
        ];

        await prisma.report.createMany({
            data: reports,
            skipDuplicates: true
        });
    }

    console.log("Extended fake data seeding completed successfully.");
};