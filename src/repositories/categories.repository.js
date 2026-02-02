import { prisma } from "../db/index.js";

export const getAllCategories = ({ name } = {}) =>
    prisma.category.findMany({
        where: name
            ? {
                  name: {
                      contains: name,
                      mode: "insensitive"
                  }
              }
            : undefined,
        select: {
            id: true,
            name: true,
            parentId: true
        },
        orderBy: { name: "asc" }
    });
