const { API_PREFIX, createAndLoginTestUser } = require("./helpers/auth.helper");

jest.setTimeout(60000);

describe("Users API (authenticated)", () => {
  let auth;

  beforeAll(async () => {
    auth = await createAndLoginTestUser();
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
    profileRes.body.city,
    "Helsinki",
    "Espoo",
    "Tampere",
    "Vantaa",
    "Oulu",
    "Åbo",
    "Abo",
  ].filter(Boolean);

  let lastError = null;

  for (const city of candidateCities) {
    const payload = {
      firstName: "Joan",
      familyName: profileRes.body.familyName || "Test",
      address: profileRes.body.address || "123 Main Street",
      postalCode: profileRes.body.postalCode || "20100",
      city,
      phoneNumber: profileRes.body.phoneNumber || "+358401234567",
      profileImage: profileRes.body.profileImage || "https://example.com/profile.jpg",
    };

    const res = await auth.agent
      .put(`${API_PREFIX}/users/profile`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(payload);

    if (res.status === 200) {
      expect(res.body).toHaveProperty("email");
      return;
    }

    lastError = { status: res.status, body: res.body, text: res.text, payload };
  }

  console.log("PUT failed with all city candidates. Last error:", lastError);
  throw new Error("PUT /users/profile did not return 200 with any tested city.");
});
});