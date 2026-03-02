import request from "supertest";
import app from "../../app.js";
import { API_PREFIX, createAuthContext } from "../helpers/helper.js";

const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

function isJson(res) {
    return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Notifications + Saved Searches API", () => {
    let auth;

    beforeEach(async () => {
        auth = await createAuthContext();
    });

    describe("Notifications - authenticated", () => {
        test("GET /notifications -> 200 returns notifications + pagination", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/notifications`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(isJson(res)).toBe(true);
            expect(res.body).toHaveProperty("notifications");
            expect(Array.isArray(res.body.notifications)).toBe(true);
            expect(res.body).toHaveProperty("pagination");
        });

        test("GET /notifications?unreadOnly=true -> 200", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/notifications`)
                .query({ unreadOnly: true })
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(isJson(res)).toBe(true);
            expect(Array.isArray(res.body?.notifications || [])).toBe(true);
        });

        test("PUT /notifications/:id/read -> 404 when notification does not exist", async () => {
            const res = await request(app)
                .put(`${API_PREFIX}/notifications/${MISSING_UUID}/read`)
                .set(auth.headers);

            expect(res.status).toBe(404);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("GET /notifications?page=0 -> 400 invalid pagination", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/notifications`)
                .query({ page: 0 })
                .set(auth.headers);

            expect(res.status).toBe(400);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });
    });

    describe("Notifications - unauthenticated", () => {
        test("GET /notifications -> 401", async () => {
            const res = await request(app).get(`${API_PREFIX}/notifications`);

            expect(res.status).toBe(401);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("PUT /notifications/:id/read -> 401", async () => {
            const res = await request(app).put(`${API_PREFIX}/notifications/${MISSING_UUID}/read`);

            expect(res.status).toBe(401);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });
    });

    describe("Saved search - authenticated", () => {
        test("POST /saved_search -> 201 creates a saved search", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/saved_search`)
                .set(auth.headers)
                .send({
                    searchTerms: ["laptop"],
                    email: true,
                    in_app: true
                });

            expect(res.status).toBe(201);
            expect(isJson(res)).toBe(true);
            expect(res.body).toHaveProperty("id");
        });

        test("GET /saved-search -> 200 returns savedSearches", async () => {
            const res = await request(app)
                .get(`${API_PREFIX}/saved-search`)
                .set(auth.headers);

            expect(res.status).toBe(200);
            expect(isJson(res)).toBe(true);
            expect(res.body).toHaveProperty("savedSearches");
            expect(Array.isArray(res.body.savedSearches)).toBe(true);
        });

        test("PUT /saved-search/:id -> 404 when search does not exist", async () => {
            const res = await request(app)
                .put(`${API_PREFIX}/saved-search/${MISSING_UUID}`)
                .set(auth.headers)
                .send({ email: false, in_app: false });

            expect(res.status).toBe(404);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("DELETE /saved-search/:id -> 404 when search does not exist", async () => {
            const res = await request(app)
                .delete(`${API_PREFIX}/saved-search/${MISSING_UUID}`)
                .set(auth.headers);

            expect(res.status).toBe(404);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("POST /saved_search -> 400 when searchTerms has more than one keyword", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/saved_search`)
                .set(auth.headers)
                .send({
                    searchTerms: ["laptop", "bike"],
                    email: true,
                    in_app: true
                });

            expect(res.status).toBe(400);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("PUT /saved-search/:id -> 400 on empty update payload", async () => {
            const res = await request(app)
                .put(`${API_PREFIX}/saved-search/${MISSING_UUID}`)
                .set(auth.headers)
                .send({});

            expect(res.status).toBe(400);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });
    });

    describe("Saved search - unauthenticated", () => {
        test("POST /saved_search -> 401", async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/saved_search`)
                .send({ searchTerms: ["laptop"], email: true, in_app: true });

            expect(res.status).toBe(401);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });

        test("GET /saved-search -> 401", async () => {
            const res = await request(app).get(`${API_PREFIX}/saved-search`);

            expect(res.status).toBe(401);
            if (isJson(res)) {
                expect(res.body).toHaveProperty("message");
            }
        });
    });
});