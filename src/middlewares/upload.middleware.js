import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ensureUploadDir = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
};

export const createProfileImageUploader = () => {
    const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
    ensureUploadDir(uploadDir);

    const storage = multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || "");
            cb(null, `${crypto.randomUUID()}${ext}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG or PNG images are allowed."));
        }
        return cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 3 * 1024 * 1024 }
    });
};

export const uploadProfileImage = (req, res, next) => {
    const uploader = createProfileImageUploader();
    uploader.single("profileImage")(req, res, (err) => {
        if (!err) {
            return next();
        }
        const error = new Error(err.message || "Invalid profile image upload.");
        error.statusCode = 400;
        return next(error);
    });
};
