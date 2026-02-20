import IORedis from "ioredis";
import { env } from "../config/env.js";

export const createRedisConnection = () =>
    new IORedis({
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password || undefined,
        maxRetriesPerRequest: null
    });