const request = require("supertest");

const BASE_URL = "http://localhost:3000";
const API_PREFIX = "/api"; // ajusta si es /api/v1

describe("User API", () => {
  test("GET /users/profile should return 401 if not authenticated", async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/users/profile`);
    expect(res.status).toBe(401);
  });

  test("PUT /users/profile should return 401 if not authenticated", async () => {
    const res = await request(BASE_URL)
      .put(`${API_PREFIX}/users/profile`)
      .send({ name: "New Name" });

    expect(res.status).toBe(401);
  });
});