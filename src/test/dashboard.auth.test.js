const { createAndLoginTestUser, API_PREFIX } = require("./helpers/auth.helper");

jest.setTimeout(60000);

function isNumberOrNull(x) {
  return typeof x === "number" || x === null;
}

function isStringOrNull(x) {
  return typeof x === "string" || x === null;
}

describe("Dashboard API (authenticated)", () => {
  let auth;

  beforeAll(async () => {
    auth = await createAndLoginTestUser();
  });

  test("GET /dashboard/analytics -> 200 and has numeric counters", async () => {
    const res = await auth.agent.get(`${API_PREFIX}/dashboard/analytics`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");

    const body = res.body || {};
    const keys = ["totalPosted", "totalSold", "totalGivenAway", "totalRented", "activeItems"];

    for (const k of keys) {
      if (k in body) {
        expect(isNumberOrNull(body[k])).toBe(true);
      }
    }
  });

  test("GET /dashboard/items -> 200 and returns items array + pagination (if present)", async () => {
    const res = await auth.agent.get(`${API_PREFIX}/dashboard/items`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");

    const body = res.body || {};

    if ("items" in body) {
      expect(Array.isArray(body.items)).toBe(true);

      if (body.items.length > 0) {
        const item = body.items[0];

        if (item && typeof item === "object") {
          if ("id" in item) expect(isNumberOrNull(item.id)).toBe(true);
          if ("title" in item) expect(isStringOrNull(item.title)).toBe(true);
          if ("city" in item) expect(isStringOrNull(item.city)).toBe(true);
          if ("status" in item) expect(isStringOrNull(item.status)).toBe(true);
        }
      }
    }

    if ("pagination" in body && body.pagination && typeof body.pagination === "object") {
      const p = body.pagination;
      if ("page" in p) expect(typeof p.page === "number").toBe(true);
      if ("limit" in p) expect(typeof p.limit === "number").toBe(true);
      if ("total" in p) expect(typeof p.total === "number").toBe(true);
      if ("totalPages" in p) expect(typeof p.totalPages === "number").toBe(true);
    }
  });

  test("GET /dashboard/ratings -> 200 and returns ratings summary (robust)", async () => {
    const res = await auth.agent.get(`${API_PREFIX}/dashboard/ratings`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");

    const body = res.body || {};

    if ("overallRating" in body) {
      expect(isNumberOrNull(body.overallRating)).toBe(true);
    }
    if ("totalRatings" in body) {
      expect(typeof body.totalRatings === "number").toBe(true);
    }
    if ("ratings" in body) {
      expect(Array.isArray(body.ratings)).toBe(true);

      if (body.ratings.length > 0) {
        const r = body.ratings[0];
        if (r && typeof r === "object") {
          if ("id" in r) expect(isNumberOrNull(r.id)).toBe(true);
          if ("rating" in r) expect(isNumberOrNull(r.rating)).toBe(true);
          if ("comment" in r) expect(isStringOrNull(r.comment)).toBe(true);
        }
      }
    }
  });
});
