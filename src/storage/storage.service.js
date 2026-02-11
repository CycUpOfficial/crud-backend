import path from "path";
import multer from "multer";
import { env } from "../config/env.js";
import { createStorageDriver } from "./storage.factory.js";

const DEFAULT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_MAX_FILE_SIZE = 3 * 1024 * 1024;

const baseDir = path.isAbsolute(env.storage.local.baseDir)
    ? env.storage.local.baseDir
    : path.join(process.cwd(), env.storage.local.baseDir);

const driver = createStorageDriver({
    driver: env.storage.driver,
    local: {
        baseDir,
        baseUrl: env.storage.local.baseUrl
    },
    s3: env.storage.s3
});

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

export const parseMultipleFiles = ({ req, res, fieldName, maxFiles, allowedMimeTypes, maxFileSize }) =>
    new Promise((resolve, reject) => {
        const uploader = createMemoryUploader({ allowedMimeTypes, maxFileSize });
        uploader.array(fieldName, maxFiles)(req, res, (err) => {
            if (err) {
                const error = new Error(err.message || "Invalid file upload.");
                error.statusCode = 400;
                return reject(error);
            }

            return resolve({
                body: req.body ?? {},
                files: req.files ?? []
            });
        });
    });

export const saveFile = async ({ file, folder }) => {
    if (!file) return null;

    return driver.save({
        folder,
        originalName: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype
    });
};

export const saveFiles = async ({ files, folder }) => {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => saveFile({ file, folder })));
};

export const saveImage = async ({ file, folder }) => saveFile({ file, folder });
export const saveImages = async ({ files, folder }) => saveFiles({ files, folder });
