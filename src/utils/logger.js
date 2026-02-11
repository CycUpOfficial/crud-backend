import fs from "fs";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");
const errorLogPath = path.join(logDir, "error.log");

const writeLine = (line) => {
    try {
        fs.mkdirSync(logDir, { recursive: true });
        fs.appendFile(errorLogPath, `${line}\n`, () => {});
    } catch (error) {
        console.error("Failed to write error log", error);
    }
};

export const logError = (err, req) => {
    const timestamp = new Date().toISOString();
    const status = err?.statusCode ?? 500;
    const method = req?.method ?? "-";
    const url = req?.originalUrl ?? req?.url ?? "-";
    const message = err?.message ?? "Unknown error";

    writeLine(`[${timestamp}] ${status} ${method} ${url} - ${message}`);

    if (err?.stack) {
        writeLine(err.stack);
    }
};
