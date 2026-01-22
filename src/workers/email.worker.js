import { Worker } from "bullmq";
import { createRedisConnection } from "../utils/redis.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const connection = createRedisConnection();

const worker = new Worker(
    "email",
    async (job) => {
        if (job.name === "verification-pin") {
            const { email, pinCode } = job.data;
            await sendVerificationEmail({ to: email, pinCode });
        }
        if (job.name === "password-reset") {
            const { email, resetToken } = job.data;
            await sendPasswordResetEmail({ to: email, resetToken });
        }
    },
    { connection }
);

worker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
});

worker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
});