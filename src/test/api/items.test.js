import request from "supertest";
import app from "../../app.js";
import { API_PREFIX, createAuthContext } from "../helpers/helper.js";

const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

describe("Items API", () => {
    let auth;

    beforeEach(async () => {
        auth = await createAuthContext();
    });

    describe("Unauthenticated", () => {
        test("GET /items -> 200", async () => {
            const res = await request(app).get(`${API_PREFIX}/items`);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"] || "").toContain("application/json");
        });

        test("POST /items -> 401", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/items`)
                .send({});

            expect(res.status).toBe(401);
        });

        test("PUT /items/:itemId -> 401", async () => {
            const res = await request(app)
                .put(`${API_PREFIX}/items/${MISSING_UUID}`)
                .send({});

            expect(res.status).toBe(401);
        });

        test("DELETE /items/:itemId -> 401", async () => {
            const res = await request(app).delete(`${API_PREFIX}/items/${MISSING_UUID}`);

            expect(res.status).toBe(401);
        });

        test("POST /items/:itemId/mark-sold -> 401", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/items/${MISSING_UUID}/mark-sold`)
                .send({ buyerEmail: "someone@abo.fi" });

            expect(res.status).toBe(401);
        });

        test("GET /items with invalid enum query -> 400", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/items`)
                .query({ itemType: "invalid" });

            expect(res.status).toBe(400);
        });
    });

    describe("Authenticated", () => {
        test("GET /items -> 200", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/items`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(res.headers["content-type"] || "").toContain("application/json");
        });

        test("GET /items/:itemId -> 404 when item does not exist", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/items/${MISSING_UUID}`)
                .set(auth.headers);

            expect(res.status).toBe(404);
        });

        test("POST /items -> 400 or 422 on invalid payload", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/items`)
                .set(auth.headers)
                .field("title", "Invalid Item");

            expect([400, 422]).toContain(res.status);
        });

        test("PUT /items/:itemId -> 400 or 404 when item does not exist", async () => {
            const res = await request(app)
                .put(`${API_PREFIX}/items/${MISSING_UUID}`)
                .set(auth.headers)
                .field({ title: "Updated" });

            expect([400, 404]).toContain(res.status);
        });

        test("DELETE /items/:itemId -> 400 or 404 when item does not exist", async () => {
            const res = await request(app)
                .delete(`${API_PREFIX}/items/${MISSING_UUID}`)
                .set(auth.headers);

            expect([400, 404]).toContain(res.status);
        });

        test("POST /items/:itemId/mark-sold -> 400 or 404 when item does not exist", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/items/${MISSING_UUID}/mark-sold`)
                .set(auth.headers)
                .send({ buyerEmail: "buyer@example.com" });

            expect([400, 404]).toContain(res.status);
        });
    });
});