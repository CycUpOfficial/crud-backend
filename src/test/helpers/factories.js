import crypto from "crypto";
import { prisma } from "../../db/index.js";
import { ensureBaseCategory, ensureBaseCity } from "./db.helper.js";

const randomSuffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const randomToken = () => crypto.randomBytes(16).toString("hex");

export const buildProfilePayload = async (overrides = {}) => {
  const city = await ensureBaseCity();
  const suffix = randomSuffix();

  return {
    username: overrides.username ?? `user_${suffix}`,
    firstName: overrides.firstName ?? "Test",
    familyName: overrides.familyName ?? "User",
    address: overrides.address ?? "123 Main Street",
    postalCode: overrides.postalCode ?? "20100",
    city: overrides.city ?? city.name,
    phoneNumber: overrides.phoneNumber ?? "+358401234567"
  };
};


export const createUser = async (overrides = {}) => {
  const city = overrides.cityId ? null : await ensureBaseCity();
  const suffix = randomSuffix();

  return prisma.user.create({
    data: {
      email: overrides.email ?? `user.${suffix}@example.com`,
      username: overrides.username ?? `user_${suffix}`,
      passwordHash: overrides.passwordHash ?? "HASHED",
      isAdmin: overrides.isAdmin ?? false,
      isVerified: overrides.isVerified ?? true,
      cityId: overrides.cityId ?? city?.id ?? null,
      firstName: overrides.firstName,
      familyName: overrides.familyName,
      address: overrides.address,
      postalCode: overrides.postalCode,
      phoneNumber: overrides.phoneNumber,
      profileImageUrl: overrides.profileImageUrl
    }
  });
};

export const createSession = async (userId, overrides = {}) => {
  const sessionToken = overrides.sessionToken ?? randomToken();
  const expiresAt = overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt
    }
  });

  return { session, sessionToken };
};

export const createItem = async (overrides = {}) => {
  const [city, category] = await Promise.all([ensureBaseCity(), ensureBaseCategory()]);
  const owner = overrides.ownerId ? null : await createUser();

  return prisma.item.create({
    data: {
      ownerId: overrides.ownerId ?? owner.id,
      title: overrides.title ?? `Item_${randomSuffix()}`,
      categoryId: overrides.categoryId ?? category.id,
      condition: overrides.condition ?? "used",
      description: overrides.description ?? "Test item description",
      address: overrides.address ?? "Market Street 1",
      cityId: overrides.cityId ?? city.id,
      itemType: overrides.itemType ?? "selling",
      sellingPrice: overrides.sellingPrice ?? "10.00",
      status: overrides.status ?? "published"
    }
  });
};
