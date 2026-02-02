import path from "path";
import multer from "multer";
import { createLocalStorageDriver } from "./drivers/local.driver.js";

const DEFAULT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_MAX_FILE_SIZE = 3 * 1024 * 1024;

const baseDir = path.join(process.cwd(), "uploads");
const baseUrl = "/uploads";

const driver = createLocalStorageDriver({ baseDir, baseUrl });

const createMemoryUploader = ({ allowedMimeTypes, maxFileSize } = {}) => {
    const fileFilter = (req, file, cb) => {
        const allowed = allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type."));
        }
        return cb(null, true);
    };

    return multer({
        storage: multer.memoryStorage(),
        fileFilter,
        limits: { fileSize: maxFileSize ?? DEFAULT_MAX_FILE_SIZE }
    });
};

export const parseSingleFile = ({ req, res, fieldName, allowedMimeTypes, maxFileSize }) =>
    new Promise((resolve, reject) => {
        const uploader = createMemoryUploader({ allowedMimeTypes, maxFileSize });
        uploader.single(fieldName)(req, res, (err) => {
            if (err) {
                const error = new Error(err.message || "Invalid file upload.");
                error.statusCode = 400;
                return reject(error);
            }

            return resolve({
                body: req.body ?? {},
                file: req.file ?? null
            });
        });
    });

export const saveFile = async ({ file, folder }) => {
    if (!file) return null;

    return driver.save({
        folder,
        originalName: file.originalname,
        buffer: file.buffer
    });
};

export const saveImage = async ({ file, folder }) => saveFile({ file, folder });
