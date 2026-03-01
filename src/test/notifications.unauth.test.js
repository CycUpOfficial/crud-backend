// src/test/notifications.unauth.test.js
const request = require("supertest");
const { BASE_URL, API_PREFIX } = require("./helpers/auth.helper");

jest.setTimeout(60000);

function isJson(res) {
  return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Notifications + Saved Searches API (unauthenticated)", () => {
  test("GET /notifications -> 401", async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/notifications`)
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  test("POST /notifications/:id/read -> 401", async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/notifications/1/read`)
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  test("POST /saved-searches -> 401", async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/saved-searches`)
      .send({ searchTerms: ["laptop"], email: true, in_app: true })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  test("GET /saved-searches -> 401", async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/saved-searches`)
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  // If your Swagger uses PUT instead of PATCH, change .patch to .put here.
  test("PATCH /saved-searches/:id -> 401", async () => {
    const res = await request(BASE_URL)
      .patch(`${API_PREFIX}/saved-searches/1`)
      .send({ email: false, in_app: false })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  test("DELETE /saved-searches/:id -> 401", async () => {
    const res = await request(BASE_URL)
      .delete(`${API_PREFIX}/saved-searches/1`)
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });
});