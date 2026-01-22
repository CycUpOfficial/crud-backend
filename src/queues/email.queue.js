import { Queue } from "bullmq";
import { createRedisConnection } from "../utils/redis.js";

const connection = createRedisConnection();

export const emailQueue = new Queue("email", { connection });

export const enqueueVerificationEmail = async ({ email, pinCode }) =>
    emailQueue.add(
        "verification-pin",
        { email, pinCode },
        {
            attempts: 5,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false
        }
    );

export const enqueuePasswordResetEmail = async ({ email, resetToken }) =>
    emailQueue.add(
        "password-reset",
        { email, resetToken },
        {
            attempts: 5,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false
        }
    );