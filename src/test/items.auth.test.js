import { jest } from "@jest/globals";
import { API_PREFIX, createAndLoginTestUser } from "./helpers/auth.helper.js";

jest.setTimeout(60000);

const TEST_IMAGE_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

function pickFirstArray(responseBody, key) {
  if (!responseBody || typeof responseBody !== "object") return null;
  if (!Array.isArray(responseBody[key])) return null;
  return responseBody[key][0] || null;
}

describe("Items API (authenticated via DB session)", () => {
  let auth;
  let categoryId;
  let cityId;
  let createdItemId;

  beforeAll(async () => {
    auth = await createAndLoginTestUser();

    const categoriesRes = await auth.agent.get(`${API_PREFIX}/categories`);
    const firstCategory = pickFirstArray(categoriesRes.body, "categories");

    const citiesRes = await auth.agent.get(`${API_PREFIX}/cities`);
    const firstCity = pickFirstArray(citiesRes.body, "cities");

    categoryId = firstCategory?.id;
    cityId = firstCity?.id;
  });

  test("POST /items -> creates an item (201)", async () => {
    expect(categoryId).toBeTruthy();
    expect(cityId).toBeTruthy();

    const res = await auth.agent
      .post(`${API_PREFIX}/items`)
      .field("title", "Test Item")
      .field("description", "Item created by Jest test")
      .field("address", "Test street 1")
      .field("condition", "used")
      .field("itemType", "selling")
      .field("sellingPrice", "10")
      .field("categoryId", categoryId)
      .field("cityId", cityId)
      .field("mainPhotoIndex", "0")
      .attach("photos", TEST_IMAGE_BUFFER, {
        filename: "1.jpg",
        contentType: "image/jpeg"
      });

    expect(res.status).toBe(201);
    expect(res.headers["content-type"] || "").toContain("application/json");
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("id");
    createdItemId = res.body.id;
  });

  test("GET /items/:itemId -> returns created item (200)", async () => {
    expect(createdItemId).toBeTruthy();

    const res = await auth.agent.get(`${API_PREFIX}/items/${createdItemId}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"] || "").toContain("application/json");
    expect(res.body).toHaveProperty("id", createdItemId);
  });

  test("PUT /items/:itemId -> updates item title (200)", async () => {
    expect(createdItemId).toBeTruthy();

    const res = await auth.agent
      .put(`${API_PREFIX}/items/${createdItemId}`)
      .field({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdItemId);
    expect(res.body).toHaveProperty("title");
  });

  test("POST /items -> 400 on missing required fields", async () => {
    const res = await auth.agent
      .post(`${API_PREFIX}/items`)
      .field("title", "Invalid Item");

    expect([400, 422]).toContain(res.status);
  });

  test("DELETE /items/:itemId -> 404 when item does not exist", async () => {
    const res = await auth.agent.delete(
      `${API_PREFIX}/items/00000000-0000-0000-0000-000000000000`
    );

    expect([400, 404]).toContain(res.status);
  });
});