import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import request from "supertest";

const prisma = new PrismaClient();

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
export const API_PREFIX = process.env.API_PREFIX || "/api";
const COOKIE_NAME = process.env.COOKIE_NAME || "session";

async function getRequestTarget() {
  if (process.env.API_BASE_URL) {
    return BASE_URL;
  }

  const mod = await import("../../app.js");
  return mod.default;
}

function makeSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function createDbUser(overrides = {}) {
  const suffix = crypto.randomBytes(4).toString("hex");
  const email = overrides.email || `test.${Date.now()}.${suffix}@abo.fi`;
  const username = overrides.username || `test_${Date.now()}_${suffix}`;

  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash: "PENDING",
      isVerified: true,
      firstName: "Test",
      familyName: "User",
      ...overrides
    }
  });
}

async function createDbSessionForUser(userId, overrides = {}) {
  const sessionToken = overrides.sessionToken || makeSessionToken();
  const expiresAt = overrides.expiresAt || new Date(Date.now() + 1000 * 60 * 60);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
      ...overrides
    }
  });

  return { session, sessionToken };
}

export async function getAuthedAgent({ userOverrides = {}, sessionOverrides = {} } = {}) {
  const requestTarget = await getRequestTarget();
  const user = await createDbUser(userOverrides);
  const { sessionToken } = await createDbSessionForUser(user.id, sessionOverrides);

  const agent = request.agent(requestTarget);
  const cookie = `${COOKIE_NAME}=${sessionToken}`;

  return { agent, user, sessionToken, cookie };
}

export { BASE_URL, prisma };