import request from "supertest";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_PREFIX = process.env.API_PREFIX || "/api";

let requestTarget;

beforeAll(async () => {
  if (process.env.API_BASE_URL) {
    requestTarget = BASE_URL;
  } else {
    const mod = await import("../app.js");
    requestTarget = mod.default;
  }
});

describe("Items API (unauthenticated)", () => {
  test("GET /items -> 200 when not authenticated", async () => {
    const res = await request(requestTarget).get(`${API_PREFIX}/items`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");
  });

  test("POST /items -> 401 when not authenticated", async () => {
    const res = await request(requestTarget)
      .post(`${API_PREFIX}/items`)
      .send({});

    expect(res.status).toBe(401);
  });

  test("PUT /items/:itemId -> 401 when not authenticated", async () => {
    const res = await request(requestTarget)
      .put(`${API_PREFIX}/items/any-id`)
      .send({});

    expect(res.status).toBe(401);
  });

  test("DELETE /items/:itemId -> 401 when not authenticated", async () => {
    const res = await request(requestTarget).delete(`${API_PREFIX}/items/any-id`);
    expect(res.status).toBe(401);
  });

  test("POST /items/:itemId/mark-sold -> 401 when not authenticated", async () => {
    const res = await request(requestTarget)
      .post(`${API_PREFIX}/items/any-id/mark-sold`)
      .send({ buyerEmail: "someone@abo.fi" });

    expect(res.status).toBe(401);
  });
});