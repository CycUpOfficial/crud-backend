import request from "supertest";
import { env } from "../../config/env.js";
import { createItem, createSession, createUser } from "../helpers/factories.js";
import { API_PREFIX } from "../helpers/helper.js";

const { default: app } = await import("../../app.js");

function isJson(res) {
  return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Ratings API", () => {
  let item = null;
  let authCookie = null;

  beforeEach(async () => {
    const seller = await createUser();
    const buyer = await createUser();
    item = await createItem({
      ownerId: seller.id,
      buyerId: buyer.id,
      status: "sold"
    });

    const { sessionToken } = await createSession(buyer.id);
    authCookie = `${env.cookie.name}=${sessionToken}`;
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
        .set("Cookie", authCookie)
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
        .set("Cookie", authCookie)
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
        .set("Cookie", authCookie)
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
  });
});