import { prisma } from "../db/index.js";

export const getAllCities = ({ name } = {}) =>
    prisma.city.findMany({
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
            name: true
        },
        orderBy: { name: "asc" }
    });
