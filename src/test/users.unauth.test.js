const request = require("supertest");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_PREFIX = process.env.API_PREFIX || "/api";

describe("Users API (unauthenticated)", () => {
  test("GET /users/profile should return 401 when not authenticated", async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/users/profile`);
    expect(res.status).toBe(401);

    if (res.body && typeof res.body === "object") {
      expect(res.body).toHaveProperty("message");
    }
  });

  test("PUT /users/profile should return 401 when not authenticated", async () => {
    const res = await request(BASE_URL)
      .put(`${API_PREFIX}/users/profile`)
      .send({ firstName: "John" });

    expect(res.status).toBe(401);

    if (res.body && typeof res.body === "object") {
      expect(res.body).toHaveProperty("message");
    }
  });

  test("PUT /users/profile with invalid input should return 400 or 401", async () => {
    const res = await request(BASE_URL)
      .put(`${API_PREFIX}/users/profile`)
      .send({ postalCode: 12345 });

    expect([400, 401]).toContain(res.status);
  });
});