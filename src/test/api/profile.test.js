import request from "supertest";
import app from "../../app.js";
import {API_PREFIX, createAuthContext} from "../helpers/auth.helper.js";
import {buildProfilePayload} from "../helpers/factories.js";

describe("Users API (authenticated)", () => {
    let auth;

    beforeEach(async () => {
        auth = await createAuthContext();
    });

    test("GET /users/profile -> 200 when authenticated", async () => {
        const res = await request(app)
            .get(`${API_PREFIX}/users/profile`)
            .set(auth.headers);

        expect(res.status).toBe(200);
        expect(res.headers["content-type"] || "").toContain("application/json");
        expect(res.body).toHaveProperty("email");
    });

    test("PUT /users/profile -> updates profile and returns 200", async () => {
        const payload = await buildProfilePayload({
            firstName: "Joan"
        });

        const res = await request(app)
            .put(`${API_PREFIX}/users/profile`)
            .set(auth.headers)
            .field("username", payload.username)
            .field("firstName", payload.firstName)
            .field("familyName", payload.familyName)
            .field("address", payload.address)
            .field("postalCode", payload.postalCode)
            .field("city", payload.city)
            .field("phoneNumber", payload.phoneNumber);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email");
    });

    test("GET /users/profile should return 401 when not authenticated", async () => {
        const res = await request(app).get(`${API_PREFIX}/users/profile`);
        expect(res.status).toBe(401);

        if (res.body && typeof res.body === "object") {
            expect(res.body).toHaveProperty("message");
        }
    });

    test("PUT /users/profile should return 401 when not authenticated", async () => {
        const res = await request(app)
            .put(`${API_PREFIX}/users/profile`)
            .send({firstName: "John"});

        expect(res.status).toBe(401);

        if (res.body && typeof res.body === "object") {
            expect(res.body).toHaveProperty("message");
        }
    });

    test("PUT /users/profile with invalid input should return 400 or 401", async () => {
        const res = await request(app)
            .put(`${API_PREFIX}/users/profile`)
            .send({postalCode: 12345});

        expect([400, 401]).toContain(res.status);
    });
});