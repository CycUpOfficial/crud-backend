import fs from "fs";
import path from "path";
import crypto from "crypto";

const ensureDir = async (dirPath) => {
    await fs.promises.mkdir(dirPath, {recursive: true});
};

export const createLocalStorageDriver = ({baseDir, baseUrl}) => ({
    async save({folder, originalName, buffer}) {
        const ext = path.extname(originalName || "");
        const filename = `${crypto.randomUUID()}${ext}`;
        const targetDir = path.join(baseDir, folder);
        await ensureDir(targetDir);

        const filePath = path.join(targetDir, filename);
        await fs.promises.writeFile(filePath, buffer);

        const key = path.join(folder, filename).replace(/\\/g, "/");
        const url = `${baseUrl}/${key}`.replace(/\\/g, "/");

        return {
            key,
            url,
            size: buffer?.length ?? 0
        };
    }
});
