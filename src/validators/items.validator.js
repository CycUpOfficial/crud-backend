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
//todo: update swagger for