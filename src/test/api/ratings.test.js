import request from "supertest";
import app from "../../app.js";
import { createItem, createUser } from "../helpers/factories.js";
import { API_PREFIX, createAuthContext } from "../helpers/helper.js";

const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

function isJson(res) {
  return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Ratings API", () => {
  let item = null;
  let auth = null;

  beforeEach(async () => {
    auth = await createAuthContext();
    const seller = await createUser();
    item = await createItem({
      ownerId: seller.id,
      buyerId: auth.user.id,
      status: "sold"
    });
  });

  describe("Unauthenticated", () => {
    test("POST /items/:itemId/ratings -> 401 when not authenticated (or 404 if item not found first)", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${item.id}/ratings`)
        .send({ rating: 5, comment: "Great seller!" })
        .set("Accept", "application/json");

      expect(res.status).toBe(401);

      if (res.status === 401 && isJson(res)) {
        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("not");
      }
    });
  });

  describe("Authenticated", () => {
    test("POST /items/:itemId/ratings -> 400 for invalid rating value", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${item.id}/ratings`)
        .set(auth.headers)
        .send({ rating: 999, comment: "nope" })
        .set("Accept", "application/json");

      expect(res.status).toBe(400);

      if (isJson(res)) {
        expect(res.body).toHaveProperty("message");
        expect(String(res.body.message).toLowerCase()).toContain("rating");
      }
    });

    test("POST /items/:itemId/ratings -> 400 for missing body fields", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${item.id}/ratings`)
        .set(auth.headers)
        .send({})
        .set("Accept", "application/json");

      expect(res.status).toBe(400);

      if (isJson(res)) {
        expect(res.body).toHaveProperty("message");
      }
    });

    test("POST /items/:itemId/ratings -> 200 when buyer rates seller", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${item.id}/ratings`)
        .set(auth.headers)
        .send({ rating: 5, comment: "Great seller, item as described!" })
        .set("Accept", "application/json");

      expect(res.status).toBe(200);

      if (isJson(res)) {
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("itemId", item.id);
        expect(res.body).toHaveProperty("rating", 5);
        expect(res.body).toHaveProperty("comment");
      }
    });

    test("POST /items/:itemId/ratings -> 400 when rating is below allowed range", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${item.id}/ratings`)
        .set(auth.headers)
        .send({ rating: 0, comment: "too low" })
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      if (isJson(res)) {
        expect(res.body).toHaveProperty("message");
      }
    });

    test("POST /items/:itemId/ratings -> 404 when item does not exist", async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/items/${MISSING_UUID}/ratings`)
        .set(auth.headers)
        .send({ rating: 5, comment: "Great seller" })
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      if (isJson(res)) {
        expect(res.body).toHaveProperty("message");
      }
    });
  });
});