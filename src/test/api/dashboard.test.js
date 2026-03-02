import request from "supertest";
import app from "../../app.js";
import { API_PREFIX, createAuthContext } from "../helpers/helper.js";

describe("Dashboard API", () => {
    let auth;

    beforeEach(async () => {
        auth = await createAuthContext();
    });

    describe("Authenticated", () => {
        test("GET /dashboard/analytics -> 200", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/dashboard/analytics`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"] || "").toContain("application/json");
        });

        test("GET /dashboard/items -> 200", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/dashboard/items`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"] || "").toContain("application/json");
        });

        test("GET /dashboard/ratings -> 200", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/dashboard/ratings`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"] || "").toContain("application/json");
        });

        test("GET /dashboard/items with invalid status -> 400", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/dashboard/items`)
                .query({ status: "invalid" })
                .set(auth.headers);

            expect(res.status).toBe(400);
        });
    });

    describe("Unauthenticated", () => {
        test("GET /dashboard/analytics -> 401", async () => {
            const res = await request(app).get(`${API_PREFIX}/dashboard/analytics`);
            expect(res.status).toBe(401);
        });

        test("GET /dashboard/items -> 401", async () => {
            const res = await request(app).get(`${API_PREFIX}/dashboard/items`);
            expect(res.status).toBe(401);
        });

        test("GET /dashboard/ratings -> 401", async () => {
            const res = await request(app).get(`${API_PREFIX}/dashboard/ratings`);
            expect(res.status).toBe(401);
        });
    });
});