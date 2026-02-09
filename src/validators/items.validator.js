import { z } from "zod";

const toNumber = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
};

export const createItemSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).max(100),
        categoryId: z.string().uuid(),
        brandName: z.string().trim().min(1).optional(),
        condition: z.enum(["new", "used"]),
        description: z.string().trim().min(1).max(1000),
        address: z.string().trim().min(1),
        cityId: z.string().uuid(),
        itemType: z.enum(["selling", "giveaway", "lending"]),
        sellingPrice: z.preprocess(toNumber, z.number().positive().optional()),
        lendingPrice: z.preprocess(toNumber, z.number().positive().optional()),
        rentUnit: z.enum(["hour", "day", "week", "month"]).optional(),
        mainPhotoIndex: z.preprocess(toNumber, z.number().int().nonnegative().optional())
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export const updateItemSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).max(100).optional(),
        categoryId: z.string().uuid().optional(),
        brandName: z.string().trim().min(1).optional(),
        condition: z.enum(["new", "used"]).optional(),
        description: z.string().trim().min(1).max(1000).optional(),
        address: z.string().trim().min(1).optional(),
        cityId: z.string().uuid().optional(),
        itemType: z.enum(["selling", "giveaway", "lending"]).optional(),
        sellingPrice: z.preprocess(toNumber, z.number().positive().optional()),
        lendingPrice: z.preprocess(toNumber, z.number().positive().optional()),
        rentUnit: z.enum(["hour", "day", "week", "month"]).optional(),
        mainPhotoIndex: z.preprocess(toNumber, z.number().int().nonnegative().optional())
    }),
    params: z.object({
        itemId: z.string().min(1, "Item ID not found!")
    }),
    query: z.object({}).optional()
});

export const itemIdSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        itemId: z.string().min(1, "Item ID not found!")
    }),
    query: z.object({}).optional()
});

export const listItemsSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z
        .object({
            search: z.string().trim().min(1).optional(),
            city: z.string().trim().min(1).optional(),
            itemType: z.enum(["selling", "giveaway", "lending"]).optional(),
            condition: z.enum(["new", "used"]).optional(),
            minPrice: z.preprocess(toNumber, z.number().nonnegative().optional()),
            maxPrice: z.preprocess(toNumber, z.number().nonnegative().optional()),
            sortBy: z.enum(["price", "date"]).optional(),
            sortOrder: z.enum(["asc", "desc"]).optional(),
            page: z.preprocess(toNumber, z.number().int().positive().optional()),
            limit: z.preprocess(toNumber, z.number().int().positive().max(100).optional())
        })
        .optional()
});

export const markItemSoldSchema = z.object({
    body: z.object({
        buyerEmail: z.string().trim().email("Invalid buyer email format. Please provide a valid email address.")
    }),
    params: z.object({
        itemId: z.string().min(1, "Item ID not found!")
    }),
    query: z.object({}).optional()
});