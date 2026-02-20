import { jest } from "@jest/globals";
import { clearDatabase, connectTestDb, disconnectTestDb, ensureBaseData } from "./helpers/db.helper.js";

jest.setTimeout(60000);

beforeAll(async () => {
  await connectTestDb();
});

beforeEach(async () => {
  await clearDatabase();
  await ensureBaseData();
});

afterAll(async () => {
  await disconnectTestDb();
});
