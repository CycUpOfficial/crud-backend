import { jest } from "@jest/globals";
import { API_PREFIX, createAndLoginTestUser } from "./helpers/auth.helper.js";

// when running locally without an external server, tests will spin up the app
import request from "supertest";
let requestTarget;

beforeAll(async () => {
  if (process.env.API_BASE_URL) {
    requestTarget = process.env.API_BASE_URL;
  } else {
    const mod = await import("../app.js");
    requestTarget = mod.default;
  }
});

jest.setTimeout(60000);

describe("Users API (authenticated)", () => {
  let auth;
  let validCityName;

  beforeAll(async () => {
    auth = await createAndLoginTestUser();

    const citiesRes = await auth.agent.get(`${API_PREFIX}/cities`);
    const firstCity = citiesRes.body?.cities?.[0];
    validCityName = firstCity?.name;
  });

  test("GET /users/profile -> 200 when authenticated", async () => {
    const res = await auth.agent.get(`${API_PREFIX}/users/profile`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");
    expect(res.body).toHaveProperty("email");
  });

  test("PUT /users/profile -> updates profile and returns 200", async () => {
  const profileRes = await auth.agent.get(`${API_PREFIX}/users/profile`);
  expect(profileRes.status).toBe(200);

  const candidateCities = [
    validCityName,
    profileRes.body.city,
    "Helsinki",
    "Espoo",
    "Tampere",
    "Vantaa",
    "Oulu",
    "Abo",
  ].filter(Boolean);

  let lastError = null;

  for (const city of candidateCities) {
    const payload = {
      username: profileRes.body.username || `test_user_${Date.now()}`,
      firstName: "Joan",
      familyName: profileRes.body.familyName || "Test",
      address: profileRes.body.address || "123 Main Street",
      postalCode: profileRes.body.postalCode || "20100",
      city,
      phoneNumber: profileRes.body.phoneNumber || "+358401234567",
    };

    const res = await auth.agent
      .put(`${API_PREFIX}/users/profile`)
      .set("Accept", "application/json")
      .field(payload);

    if (res.status === 200) {
      expect(res.body).toHaveProperty("email");
      return;
    }

    lastError = { status: res.status, body: res.body, text: res.text, payload };
  }

  console.log("PUT failed with all city candidates. Last error:", lastError);
  throw new Error("PUT /users/profile did not return 200 with any tested city.");
});

  test("PUT /users/profile -> 400 on invalid phone number", async () => {
    expect(validCityName).toBeTruthy();

    const profileRes = await auth.agent.get(`${API_PREFIX}/users/profile`);
    expect(profileRes.status).toBe(200);

    const payload = {
      username: profileRes.body.username || `test_user_${Date.now()}`,
      firstName: "Joan",
      familyName: profileRes.body.familyName || "Test",
      address: profileRes.body.address || "123 Main Street",
      postalCode: profileRes.body.postalCode || "20100",
      city: validCityName,
      phoneNumber: "12345"
    };

    const res = await auth.agent
      .put(`${API_PREFIX}/users/profile`)
      .set("Accept", "application/json")
      .field(payload);

    expect([400, 422]).toContain(res.status);
  });
});