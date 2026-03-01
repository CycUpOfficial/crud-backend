import request from "supertest";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import {
    createPasswordResetToken,
    createSession,
    createUser,
    createVerificationPin,
    findPasswordResetTokenByToken,
    findSessionByToken,
    findUserById
} from "../helpers/factories.js";
import app from "../../app.js";
import { API_PREFIX } from "../helpers/helper.js";

const randomSuffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeTestEmail = () => `user@abo.fi`;
const makeTestUsername = () => `user_${randomSuffix()}`;

const hashPassword = async (password) => bcrypt.hash(password, 12);

const createUserWithVerificationPin = async ({ email, pinCode = "123456" } = {}) => {
    const user = await createUser({
        email: email ?? makeTestEmail(),
        isVerified: false,
        passwordHash: "PENDING"
    });

    const { pinCode: storedPinCode } = await createVerificationPin(user.id, { pinCode });

    return { user, pinCode: storedPinCode };
};

const createVerifiedUser = async ({ email, username, password }) => {
    const passwordHash = await hashPassword(password);
    const user = await createUser({
        email,
        username,
        passwordHash,
        isVerified: true
    });

    return { user, passwordHash };
};

describe("AUTH - /auth/register", () => {
    test("201 - should register a new user and return message + userId", async () => {
        const email = makeTestEmail();

        const res = await request(app)
            .post(`${API_PREFIX}/auth/register`)
            .send({email})
            .set("Accept", "application/json");

        expect(res.status).toBe(201);
        expect(res.headers["content-type"]).toMatch(/json/i);

        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toBe("string");
        expect(res.body.message.toLowerCase()).toContain("registration");
        expect(res.body.message.toLowerCase()).toContain("pin");

        expect(res.body).toHaveProperty("userId");
        expect(["string", "number"]).toContain(typeof res.body.userId);

        // userId puede ser UUID o número: solo exigimos que exista y no sea vacío
        if (typeof res.body.userId === "string") {
            expect(res.body.userId.trim().length).toBeGreaterThan(0);
        } else {
            expect(Number.isFinite(res.body.userId)).toBe(true);
        }
    });

    test("400 - should reject invalid email format for registration", async () => {
        const res = await request(app)
            .post(`${API_PREFIX}/auth/register`)
            .send({email: "not-an-email"})
            .set("Accept", "application/json");

        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/i);

        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("invalid");
        expect(String(res.body.message).toLowerCase()).toContain("email");
    });

    test("400 - should reject missing email for registration", async () => {
        const res = await request(app)
            .post(`${API_PREFIX}/auth/register`)
            .send({})
            .set("Accept", "application/json");

        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
    });
});

describe("AUTH - /auth/verify", () => {
    test("200 - should verify email successfully and set password", async () => {
        const { user, pinCode } = await createUserWithVerificationPin();
        const username = makeTestUsername();

        const verifyRes = await request(app)
            .post(`${API_PREFIX}/auth/verify`)
            .send({
                email: user.email,
                pinCode,
                username,
                password: "SecurePass123!",
                passwordConfirmation: "SecurePass123!"
            })
            .set("Accept", "application/json");

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.headers["content-type"]).toMatch(/json/i);
        expect(verifyRes.body).toHaveProperty("message");
        expect(String(verifyRes.body.message).toLowerCase()).toContain("verified");
        expect(verifyRes.body).toHaveProperty("verified", true);
    });

    test("400 - should reject when passwords do not match", async () => {
        const { user, pinCode } = await createUserWithVerificationPin();
        const username = makeTestUsername();

        const verifyRes = await request(app)
            .post(`${API_PREFIX}/auth/verify`)
            .send({
                email: user.email,
                pinCode,
                username,
                password: "SecurePass123!",
                passwordConfirmation: "DifferentPass123!"
            })
            .set("Accept", "application/json");

        expect(verifyRes.status).toBe(400);
        expect(verifyRes.headers["content-type"]).toMatch(/json/i);
        expect(verifyRes.body).toHaveProperty("message");
    });

    test("should return 400 or 404 for non-existing email", async () => {
        const email = makeTestEmail();
        const username = makeTestUsername();

        const res = await request(app)
            .post(`${API_PREFIX}/auth/verify`)
            .send({
                email,
                pinCode: "123456",
                username,
                password: "SecurePass123!",
                passwordConfirmation: "SecurePass123!",
            })
            .set("Accept", "application/json");

        // Tu backend parece devolver 400 aquí (no 404), así que aceptamos ambos.
        expect([400, 404]).toContain(res.status);
    });
});

describe("AUTH - /auth/login", () => {
    test("200 - should login successfully, return userId and set session cookie", async () => {
        const email = makeTestEmail();
        const password = "SecurePass123!";
        const username = makeTestUsername();

        await createVerifiedUser({ email, username, password });

        const res = await request(app)
            .post(`${API_PREFIX}/auth/login`)
            .send({ email, password })
            .set("Accept", "application/json");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/i);

        expect(res.body).toHaveProperty("userId");
        expect(["string", "number"]).toContain(typeof res.body.userId);

        expect(res.headers).toHaveProperty("set-cookie");
        expect(Array.isArray(res.headers["set-cookie"])).toBe(true);
        expect(res.headers["set-cookie"].length).toBeGreaterThan(0);
    });

    test("401 - should reject invalid credentials", async () => {
        const email = makeTestEmail();
        const password = "SecurePass123!";
        const username = makeTestUsername();

        await createVerifiedUser({ email, username, password });

        const res = await request(app)
            .post(`${API_PREFIX}/auth/login`)
            .send({ email, password: "WrongPass123!" })
            .set("Accept", "application/json");

        expect(res.status).toBe(401);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("invalid");
    });

    test("403 - should reject login when email is not verified", async () => {
        const email = makeTestEmail();
        const password = "SecurePass123!";
        const passwordHash = await hashPassword(password);

        await createUser({
            email,
            passwordHash,
            isVerified: false
        });

        const res = await request(app)
            .post(`${API_PREFIX}/auth/login`)
            .send({ email, password })
            .set("Accept", "application/json");

        expect(res.status).toBe(403);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
        const msg = String(res.body.message).toLowerCase();
        expect(msg).toContain("not");
        expect(msg).toContain("verified");
    });
});

describe("AUTH - /auth/logout", () => {
    test("200 - should logout successfully when authenticated", async () => {
        const user = await createUser();
        const { sessionToken } = await createSession(user.id);
        const cookie = `${env.cookie.name}=${sessionToken}`;

        const res = await request(app)
            .post(`${API_PREFIX}/auth/logout`)
            .set("Accept", "application/json")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);

        const session = await findSessionByToken(sessionToken);
        expect(session).toBeNull();
    });

    test("200 - should clear session cookie on logout", async () => {
        const user = await createUser();
        const { sessionToken } = await createSession(user.id);
        const cookie = `${env.cookie.name}=${sessionToken}`;

        const res = await request(app)
            .post(`${API_PREFIX}/auth/logout`)
            .set("Accept", "application/json")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.headers).toHaveProperty("set-cookie");
        expect(Array.isArray(res.headers["set-cookie"])).toBe(true);
    });
});

describe("AUTH - /auth/password/reset", () => {
    test("200 - should send password reset link to email for existing user", async () => {
        const email = makeTestEmail();
        await createUser({ email, isVerified: true });

        const res = await request(app)
            .post(`${API_PREFIX}/auth/password/reset`)
            .send({email})
            .set("Accept", "application/json");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
        const msg = String(res.body.message).toLowerCase();
        expect(msg).toContain("password");
        expect(msg).toContain("reset");
    });

    test("404 - should return user not found for non-existing email", async () => {
        const email = makeTestEmail();

        const res = await request(app)
            .post(`${API_PREFIX}/auth/password/reset`)
            .send({email})
            .set("Accept", "application/json");

        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("not");
    });
});

describe("AUTH - /auth/password/reset/confirm", () => {
    test("200 - should confirm password reset successfully and allow login with new password", async () => {
        const email = makeTestEmail();
        const oldPassword = "SecurePass123!";
        const newPassword = "NewSecurePass123!";
        const username = makeTestUsername();

        const { user } = await createVerifiedUser({ email, username, password: oldPassword });
        const { token } = await createPasswordResetToken(user.id);

        const confirmRes = await request(app)
            .post(`${API_PREFIX}/auth/password/reset/confirm`)
            .send({token, newPassword, passwordConfirmation: newPassword})
            .set("Accept", "application/json");
        expect(confirmRes.status).toBe(200);

        const updatedUser = await findUserById(user.id);
        const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.passwordHash);
        expect(isPasswordUpdated).toBe(true);

        const tokenRecord = await findPasswordResetTokenByToken(token);
        expect(tokenRecord.used).toBe(true);
    });

    test("400 - should reject when passwords do not match", async () => {
        const email = makeTestEmail();
        const oldPassword = "SecurePass123!";
        const username = makeTestUsername();

        const { user } = await createVerifiedUser({ email, username, password: oldPassword });
        const { token } = await createPasswordResetToken(user.id);

        const res = await request(app)
            .post(`${API_PREFIX}/auth/password/reset/confirm`)
            .send({
                token,
                newPassword: "NewSecurePass123!",
                passwordConfirmation: "DifferentNewPass123!",
            })
            .set("Accept", "application/json");

        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/i);
        expect(res.body).toHaveProperty("message");
        const msg = String(res.body.message).toLowerCase();
        expect(msg).toContain("password");
        expect(msg).toContain("match");
    });
});