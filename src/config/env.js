import dotenv from "dotenv";

dotenv.config();

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
    mongo: {
        uri: process.env.MONGO_URI ?? "mongodb://localhost:27017/cycup"
    },
    mail: {
        host: process.env.SMTP_HOST ?? "smtp.example.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASS ?? "",
        from: process.env.MAIL_FROM ?? "no-reply@cycup.com"
    },
    frontend: {
        url: process.env.Frontend_URL ?? "http://localhost:3000"
    }
};