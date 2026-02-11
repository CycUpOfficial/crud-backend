import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined) return fallback;
    return ["true", "1", "yes"].includes(String(value).toLowerCase());
};

const parseList = (value) =>
    String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const buildDatabaseUrl = ({ user, password, host, port, database }) => {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = password ? `:${encodeURIComponent(password)}` : "";
    return `postgresql://${encodedUser}${encodedPassword}@${host}:${port}/${database}`;
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseNumber(process.env.DB_PORT, 5432);
const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbName = process.env.DB_NAME ?? "app_db";
const frontendUrl = process.env.FRONTEND_URL ?? process.env.Frontend_URL ?? "http://localhost:3000";
const corsOrigins = parseList(process.env.CORS_ORIGINS);
const storageDriver = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();

export const env = {
    nodeEnv,
    port: parseNumber(process.env.PORT, 3000),
    trustProxy: parseBoolean(process.env.TRUST_PROXY, nodeEnv === "production"),
    db: {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        url:
            process.env.DATABASE_URL ??
            buildDatabaseUrl({
                user: dbUser,
                password: dbPassword,
                host: dbHost,
                port: dbPort,
                database: dbName
            })
    },
    redis: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: parseNumber(process.env.REDIS_PORT, 6379),
        password: process.env.REDIS_PASSWORD || undefined
    },
    mail: {
        host: process.env.SMTP_HOST ?? "smtp.example.com",
        port: parseNumber(process.env.SMTP_PORT, 587),
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASS ?? "",
        from: process.env.MAIL_FROM ?? "no-reply@cycup.com"
    },
    frontend: {
        url: frontendUrl
    },
    cors: {
        origins: corsOrigins.length > 0 ? corsOrigins : [frontendUrl]
    },
    storage: {
        driver: storageDriver,
        local: {
            baseDir: process.env.STORAGE_LOCAL_DIR ?? "uploads",
            baseUrl: process.env.STORAGE_LOCAL_URL ?? "/uploads"
        },
        s3: {
            bucket: process.env.S3_BUCKET ?? "",
            region: process.env.S3_REGION ?? process.env.AWS_REGION ?? "",
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? "",
            endpoint: process.env.S3_ENDPOINT ?? "",
            baseUrl: process.env.S3_BASE_URL ?? "",
            forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE, false)
        }
    },
    cookie: {
        name: process.env.COOKIE_NAME ?? "session",
        sameSite: process.env.COOKIE_SAMESITE ?? "lax",
        secure: parseBoolean(process.env.COOKIE_SECURE, nodeEnv === "production"),
        domain: process.env.COOKIE_DOMAIN || undefined
    }
};