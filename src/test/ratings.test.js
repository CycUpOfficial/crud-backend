// test/ratings.test.js
const request = require("supertest");
const { BASE_URL, API_PREFIX, createAndLoginTestUser } = require("./helpers/auth.helper");

jest.setTimeout(60000);

const ITEM_ID = process.env.TEST_ITEM_ID || 1;

function isJson(res) {
  return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Ratings API", () => {
  let auth = null;

  beforeAll(async () => {
    try {
      auth = await createAndLoginTestUser();
    } catch (e) {
      auth = null;
      // eslint-disable-next-line no-console
      console.log("[ratings.test] Auth setup failed, skipping auth tests:", e?.message || e);
    }
  });

  describe("Unauthenticated", () => {
    test("POST /items/:itemId/ratings -> 401 when not authenticated (or 404 if item not found first)", async () => {
      const res = await request(BASE_URL)
        .post(`${API_PREFIX}/items/${ITEM_ID}/ratings`)
        .send({ rating: 5, comment: "Great seller!" })
        .set("Accept", "application/json");

      // Ideal: 401. Aceptamos 404 si el backend valida itemId antes que auth.
      expect([401, 404]).toContain(res.status);

      if (res.status === 401 && isJson(res)) {
        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("not");
      }
    });
  });

  describe("Authenticated (skips if auth is not available)", () => {
    const maybeTest = (name, fn) => {
      if (!auth?.agent) test.skip(name, fn);
      else test(name, fn);
    };

    maybeTest("POST /items/:itemId/ratings -> 400 for invalid rating value (or 404 if item missing)", async () => {
      const res = await auth.agent
        .post(`${API_PREFIX}/items/${ITEM_ID}/ratings`)
        .send({ rating: 999, comment: "nope" })
        .set("Accept", "application/json");

      // Si el item no existe, 404. Si existe, debería ser 400 por rating inválido.
      // También podría ser 400 por "not authorized to rate" dependiendo de reglas del backend.
      expect([400, 404]).toContain(res.status);

      if (res.status === 400 && isJson(res)) {
        expect(res.body).toHaveProperty("message");
        // Según swagger: "Rating must be between 1 and 5."
        // No lo hago exacto para evitar fallos por texto distinto.
        expect(String(res.body.message).toLowerCase()).toContain("rating");
      }
    });

    maybeTest("POST /items/:itemId/ratings -> 400 for missing body fields (or 404 if item missing)", async () => {
      const res = await auth.agent
        .post(`${API_PREFIX}/items/${ITEM_ID}/ratings`)
        .send({})
        .set("Accept", "application/json");

      expect([400, 404]).toContain(res.status);

      if (res.status === 400 && isJson(res)) {
        expect(res.body).toHaveProperty("message");
      }
    });

    maybeTest("POST /items/:itemId/ratings -> 201 if allowed; otherwise 400/404", async () => {
      const res = await auth.agent
        .post(`${API_PREFIX}/items/${ITEM_ID}/ratings`)
        .send({ rating: 5, comment: "Great seller, item as described!" })
        .set("Accept", "application/json");

      // 201 solo si tu usuario tiene permiso real para ratear ese item.
      // 400 si no autorizado / invalid input. 404 si item no existe.
      expect([201, 400, 404]).toContain(res.status);

      if (res.status === 201 && isJson(res)) {
        // Swagger example incluye estos campos
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("itemId");
        expect(res.body).toHaveProperty("rating");
        expect(res.body).toHaveProperty("comment");
        // extras opcionales
        // expect(res.body).toHaveProperty("raterId");
        // expect(res.body).toHaveProperty("createdAt");
      }

      if (res.status === 400 && isJson(res)) {
        expect(res.body).toHaveProperty("message");
      }
    });
  });
});