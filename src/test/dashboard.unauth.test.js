const request = require("supertest");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_PREFIX = process.env.API_PREFIX || "/api";

describe("Dashboard API (unauthenticated)", () => {
  test("GET /dashboard/analytics -> 401 when not authenticated", async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/dashboard/analytics`);
    expect(res.status).toBe(401);
  });

  test("GET /dashboard/items -> 401 when not authenticated", async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/dashboard/items`);
    expect(res.status).toBe(401);
  });

  test("GET /dashboard/ratings -> 401 when not authenticated", async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/dashboard/ratings`);
    expect(res.status).toBe(401);
  });
});
