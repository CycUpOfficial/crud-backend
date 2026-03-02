import dotenv from "dotenv";

dotenv.config();

process.env.NODE_ENV = "test";
process.env.COOKIE_SECURE = "false";

const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbName = process.env.DB_NAME ?? "app_db";
const dbPort = process.env.DB_PORT ?? "5432";
const testDbHost = process.env.TEST_DB_HOST ?? "localhost";

process.env.DB_HOST = testDbHost;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("@db:")) {
	process.env.DATABASE_URL = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${testDbHost}:${dbPort}/${dbName}`;
}
