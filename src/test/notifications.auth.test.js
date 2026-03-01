// src/test/notifications.auth.test.js
const request = require("supertest");
const { BASE_URL, API_PREFIX, createAndLoginTestUser } = require("./helpers/auth.helper");

const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

jest.setTimeout(60000);

function isJson(res) {
  return String(res.headers?.["content-type"] || "").includes("application/json");
}

describe("Notifications + Saved Searches API (authenticated)", () => {
  let auth = null;

  beforeAll(async () => {
    try {
      auth = await createAndLoginTestUser();
    } catch (e) {
      auth = null;
      // eslint-disable-next-line no-console
      console.log("[notifications.auth.test] Auth setup failed, skipping auth tests:", e?.message || e);
    }
  });

  const maybeTest = (name, fn) => {
    test(name, async () => {
      if (!auth?.agent) {
        throw new Error("Auth setup failed in beforeAll; tests require a running API + mail service.");
      }
      await fn();
    });
  };

  async function getFirstNotificationId(agent) {
    const res = await agent
      .get(`${API_PREFIX}/notifications`)
      .query({ page: 1, limit: 1 })
      .set("Accept", "application/json");

    if (res.status !== 200) {
      throw new Error(`Failed to list notifications (${res.status}): ${JSON.stringify(res.body)}`);
    }
    const list = res.body?.notifications;
    if (!Array.isArray(list) || list.length === 0) return null;

    const id = list[0]?.id;
    if (id === undefined || id === null) return null;
    return String(id);
  }

  async function createSavedSearch(agent) {
    const payload = {
      searchTerms: ["laptop"],
      email: true,
      in_app: true,
    };

    const res = await agent
      .post(`${API_PREFIX}/saved_search`)
      .send(payload)
      .set("Accept", "application/json");

    if (res.status !== 201) {
      throw new Error(`Failed to create saved search (${res.status}): ${JSON.stringify(res.body)}`);
    }
    const id = res.body?.id;
    if (id === undefined || id === null) return null;
    return String(id);
  }

  // -------------------- NOTIFICATIONS: GET /notifications --------------------

  maybeTest("GET /notifications -> 200 returns notifications + pagination", async () => {
    const res = await auth.agent
      .get(`${API_PREFIX}/notifications`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(isJson(res)).toBe(true);

    expect(res.body).toHaveProperty("notifications");
    expect(Array.isArray(res.body.notifications)).toBe(true);

    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toHaveProperty("page");
    expect(res.body.pagination).toHaveProperty("limit");
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  maybeTest("GET /notifications?unreadOnly=true -> 200 and (if any) all are unread", async () => {
    const res = await auth.agent
      .get(`${API_PREFIX}/notifications`)
      .query({ unreadOnly: true })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(isJson(res)).toBe(true);

    const list = res.body?.notifications;
    expect(Array.isArray(list)).toBe(true);

    for (const n of list) {
      if (n && Object.prototype.hasOwnProperty.call(n, "read")) {
        expect(n.read).toBe(false);
      }
    }
  });

  maybeTest("GET /notifications?page=1&limit=20 -> 200 and pagination matches", async () => {
    const res = await auth.agent
      .get(`${API_PREFIX}/notifications`)
      .query({ page: 1, limit: 20 })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(isJson(res)).toBe(true);

    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 20);
  });

  // -------------------- NOTIFICATIONS: PUT /notifications/:id/read --------------------

  maybeTest("PUT /notifications/:id/read -> 200 when marking an existing notification as read (best-effort)", async () => {
    const id = await getFirstNotificationId(auth.agent);
    if (!id) return; // If there are no notifications, we cannot deterministically test 200.

    const res = await auth.agent
      .put(`${API_PREFIX}/notifications/${encodeURIComponent(id)}/read`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
  });

  maybeTest("PUT /notifications/:id/read -> 404 when notification does not exist", async () => {
    const res = await auth.agent
      .put(`${API_PREFIX}/notifications/${MISSING_UUID}/read`)
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  // -------------------- SAVED SEARCHES: POST /saved_search --------------------

  maybeTest("POST /saved_search -> 201 creates a saved search", async () => {
    const res = await auth.agent
      .post(`${API_PREFIX}/saved_search`)
      .send({
        searchTerms: ["laptop"],
        email: true,
        in_app: true,
      })
      .set("Accept", "application/json");

    expect(res.status).toBe(201);
    expect(isJson(res)).toBe(true);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("searchTerms");
    expect(Array.isArray(res.body.searchTerms)).toBe(true);
    expect(res.body).toHaveProperty("email", true);
    expect(res.body).toHaveProperty("in_app", true);
    expect(res.body).toHaveProperty("createdAt");
  });

  maybeTest("POST /saved_search -> 400 for invalid input", async () => {
    const res = await auth.agent
      .post(`${API_PREFIX}/saved_search`)
      .send({ searchTerms: [], email: true, in_app: true })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  // -------------------- SAVED SEARCHES: GET /saved-search --------------------

  maybeTest("GET /saved-search -> 200 returns savedSearches array", async () => {
    const res = await auth.agent
      .get(`${API_PREFIX}/saved-search`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(isJson(res)).toBe(true);

    expect(res.body).toHaveProperty("savedSearches");
    expect(Array.isArray(res.body.savedSearches)).toBe(true);
  });

  // -------------------- SAVED SEARCHES: PUT /saved-search/:id --------------------

  maybeTest("PUT /saved-search/:id -> 200 updates notification settings", async () => {
    const id = await createSavedSearch(auth.agent);
    if (!id) return;

    const res = await auth.agent
      .put(`${API_PREFIX}/saved-search/${encodeURIComponent(id)}`)
      .send({ email: false, in_app: false })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    if (isJson(res)) {
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", false);
      expect(res.body).toHaveProperty("in_app", false);
    }
  });

  maybeTest("PUT /saved-search/:id -> 404 when not found", async () => {
    const res = await auth.agent
      .put(`${API_PREFIX}/saved-search/${MISSING_UUID}`)
      .send({ email: false, in_app: false })
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });

  maybeTest("PUT /saved-search/:id -> 400 for invalid input", async () => {
    const id = await createSavedSearch(auth.agent);
    if (!id) return;

    const res = await auth.agent
      .put(`${API_PREFIX}/saved-search/${encodeURIComponent(id)}`)
      .send({ email: "nope", in_app: "nope" })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  // -------------------- SAVED SEARCHES: DELETE /saved-search/:id --------------------

  maybeTest("DELETE /saved-search/:id -> 200 deletes an existing saved search (best-effort)", async () => {
    const id = await createSavedSearch(auth.agent);
    if (!id) return;

    const res = await auth.agent
      .delete(`${API_PREFIX}/saved-search/${encodeURIComponent(id)}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
  });

  maybeTest("DELETE /saved-search/:id -> 404 when not found", async () => {
    const res = await auth.agent
      .delete(`${API_PREFIX}/saved-search/${MISSING_UUID}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
    if (isJson(res)) expect(res.body).toHaveProperty("message");
  });
});