import { checkDbConnectionRepo } from "../repositories/health.repository.js";

export const getHealthStatus = async () => {
    await checkDbConnectionRepo();
    return { status: "ok", database: "connected" };
};