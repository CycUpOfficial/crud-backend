import { checkDbConnection } from "../db/index.js";

export const checkDbConnectionRepo = async () => {
    await checkDbConnection();
};