import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null) return fallback;
    return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER ?? "postgres",
        password: process.env.DB_PASSWORD ?? "<DB_PASSWORD>",
        database: process.env.DB_NAME ?? "app_db"
    },
    redis: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD ?? undefined
    },
    mail: {
        host: process.env.SMTP_HOST ?? "smtp.example.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASS ?? "",
        from: process.env.MAIL_FROM ?? "no-reply@cycup.com"
    },
    frontend: {
        url: process.env.FRONTEND_URL ?? process.env.Frontend_URL ?? "http://localhost:3000"
    },
    storage: {
        driver: (process.env.STORAGE_DRIVER ?? "local").toLowerCase(),
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
    }
};