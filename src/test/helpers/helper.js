import { env } from "../../config/env.js";
import { createSession, createUser } from "./factories.js";

const API_PREFIX = process.env.API_PREFIX || "/api";
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

export const createAuthContext = async (overrides = {}) => {
    const user = await createUser(overrides.user ?? {});
    const { sessionToken } = await createSession(user.id, overrides.session ?? {});
    const cookie = `${env.cookie.name}=${sessionToken}`;

    return {
        user,
        sessionToken,
        headers: { Cookie: cookie }
    };
};

export {
    API_PREFIX,
    BASE_URL
};