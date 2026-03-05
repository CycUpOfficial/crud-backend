import crypto from "crypto";
import { readdir } from "fs/promises";
import path from "path";
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
            "/uploads/Hp 14 16gb RAM 320GB.jpg",
            "/uploads/IPHONE.jpg"
        ]
    },
    {
        title: "electronic bike",
        description: "Trek mountain bike, great for weekend trips. Recently serviced, new tires.",
        brandName: "Trek",
        condition: "used",
        itemType: "selling",
        sellingPrice: "200.00",
        photos: [
            "/uploads/e-bike_shutterstock-1024x683.jpg"
        ]
    },
    {
        title: "Sound Bar",
        description: "Delonghi espresso machine, works perfectly. Includes accessories.",
        brandName: "Delonghi",
        condition: "used",
        itemType: "selling",
        sellingPrice: "75.00",
        photos: [
            "/uploads/SOUND BAR.jpg"
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
            "/uploads/playstation-5.jpg"
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
            "/uploads/sennheiser-consumer-audio-momentum-4-wireless-headphone.png"
        ]
    },
    {
        title: "Garden Tools Set",
        description: "Free garden tools set. Shovel, rake, hoe and more. Must pickup.",
        brandName: null,
        condition: "used",
        itemType: "giveaway",
        photos: [
            "/uploads/vm-wm-viita-77-harmaa_3_20201_3.jpg"
        ]
    },
    {
        title: "Trouser",
        description: "Free textbooks for computer science students. No longer needed.",
        brandName: null,
        condition: "used",
        itemType: "giveaway",
        photos: [
            "/uploads/images.jpg"
        ]
    },
    {
        title: "Macbook Charger",
        description: "Portable Bluetooth speaker, great sound quality. JBL brand.",
        brandName: "JBL",
        condition: "used",
        itemType: "selling",
        sellingPrice: "45.00",
        photos: [
            "/uploads/MACBOOK CHARGER.jpg"
        ]
    },
    {
        title: "study table",
        description: "Ergonomic office chair, adjustable height. Good condition.",
        brandName: "IKEA",
        condition: "used",
        itemType: "selling",
        sellingPrice: "80.00",
        photos: [
            "/uploads/nio-modern-table.jpg"
        ]
    },
    {
        title: "Sofa and mat",
        description: "Wooden vintage bookshelf, solid wood. 180cm height.",
        brandName: null,
        condition: "used",
        itemType: "selling",
        sellingPrice: "120.00",
        photos: [
            "/uploads/Montana-Beige_1B-scaled.jpg"
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
    { type: "item_status_change", title: "Item expired", message: "Your item 'electronic bike' listing has expired." },
    { type: "saved_search_match", title: "New match found", message: "A new item matching your saved search 'electronics' is available." },
    { type: "rating_received", title: "New rating received", message: "You received a 5-star rating on your item." },
    { type: "saved_search_match", title: "Search alert", message: "New item 'Sound Bar' matches your saved search." },
];

const IMAGE_FILE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"]);

const IMAGE_TITLE_OVERRIDES = {
    "MACBOOK CHARGER.jpg": "Macbook Charger",
    "images.jpg": "Trouser",
    "SOUND BAR.jpg": "Sound Bar",
    "e-bike_shutterstock-1024x683.jpg": "electronic bike",
    "xavier-teo-SxAXphIPWeg-unsplash.jpg": "White Sneaker",
    "vjiyf_512.webp": "Multiplug",
    "s-l1200.jpg": "Double Bed",
    "jM9JCM8RBSykEorEqDqpzW.jpg": "Multi Sound system",
    "images (6).jpg": "Mountain Bike",
    "images (5).jpg": "Lenovo Laptop",
    "images (4).jpg": "Single Couch",
    "images (2).jpg": "Nike Sneakers",
    "images (1).jpg": "Black Shoe",
    "Cvsf8xmmpjePwVmGNLkrwU.jpg": "samsung galaxy note 20",
    "9031_2671.jpg": "Office Chaire",
    "7f9b7bef4f32b3f5c8f29afaf5d2500b.jpg_720x720q80.jpg": "Laptop charger",
    "5520c970-980b-443c-9900-ad3b548141eb.14e5e26e00dd5cff539a0ef172231d5e.webp": "3 pin multiplug",
    "2.TCH-112-R.jpg": "Table",
    "bf448cea49c2c831b6524ea235245277.jpg": "Bed side table",
    "9155ccf840f54edaa54afd740ec1902c.jpg": "Iphone 15 pro",
    "71E9sRv-6IL._UY1000_.jpg": "winter jacket"
};

const titleFromFileName = (fileName) => {
    const withoutExtension = fileName.replace(/\.[^.]+$/, "");
    const normalized = withoutExtension
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // Avoid using a UUID/hash-like filename as an item title.
    if (!normalized || /^[0-9a-f]{24,}$/i.test(normalized.replace(/\s+/g, ""))) {
        return "Student Item";
    }

    return normalized
        .split(" ")
        .map((part) => {
            if (!part) {
                return part;
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(" ");
};

const buildTemplatesFromAllImages = async() => {
    const configuredDir = process.env.STORAGE_LOCAL_DIR || "uploads";
    const imagesDirectory = path.resolve(process.cwd(), configuredDir);

    let files = [];
    try {
        files = await readdir(imagesDirectory, { withFileTypes: true });
    } catch (error) {
        console.warn(`Skipping dynamic image-based items. Could not read ${imagesDirectory}: ${error.message}`);
        return [];
    }

    const photosAlreadyCovered = new Set(
        ITEM_TEMPLATES.flatMap((template) => template.photos)
    );

    const imageFiles = files
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((fileName) => IMAGE_FILE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const generatedTemplates = [];
    for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const photoUrl = `/uploads/${fileName}`;
        if (photosAlreadyCovered.has(photoUrl)) {
            continue;
        }

        const inferredTitle = IMAGE_TITLE_OVERRIDES[fileName] || titleFromFileName(fileName);
        const mode = i % 3;
        if (mode === 0) {
            generatedTemplates.push({
                title: inferredTitle,
                description: `${inferredTitle} available in good condition.`,
                brandName: null,
                condition: "used",
                itemType: "selling",
                sellingPrice: `${40 + (i % 9) * 15}.00`,
                photos: [photoUrl]
            });
            continue;
        }

        if (mode === 1) {
            generatedTemplates.push({
                title: inferredTitle,
                description: `${inferredTitle} available for short-term lending.`,
                brandName: null,
                condition: "used",
                itemType: "lending",
                lendingPrice: `${5 + (i % 6) * 3}.00`,
                rentUnit: "day",
                photos: [photoUrl]
            });
            continue;
        }

        generatedTemplates.push({
            title: inferredTitle,
            description: `${inferredTitle} available as giveaway for pickup.`,
            brandName: null,
            condition: "used",
            itemType: "giveaway",
            photos: [photoUrl]
        });
    }

    return generatedTemplates;
};

export const seedExtendedFakeData = async({ force = false } = {}) => {
    if (force) {
        console.info("force extended seed - purging previous extended fake data");
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
                            "seller2@example.com",
                            "seller3@example.com",
                            "seller4@example.com",
                            "buyer2@example.com",
                            "buyer3@example.com"
                        ]
                    }
                }
            })
        ]);
    }

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
    const dynamicTemplates = await buildTemplatesFromAllImages();
    const allItemTemplates = [...ITEM_TEMPLATES, ...dynamicTemplates];

    if (existingItemCount < allItemTemplates.length) {
        const newItemsToCreate = allItemTemplates;

        for (let i = 0; i < newItemsToCreate.length; i++) {
            const template = newItemsToCreate[i];
            const seller = sellers[i % sellers.length];
            let status = "published";
            if (template.itemType === "selling" && i % 7 === 0) {
                status = "sold";
            } else if (i % 11 === 0) {
                status = "expired";
            } else if (i % 13 === 0) {
                status = "deleted";
            }

            const shouldHaveBuyer = template.itemType === "selling" && status === "sold";
            const buyer = shouldHaveBuyer ? buyers[0] : null;

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