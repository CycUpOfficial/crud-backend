import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const buildKey = ({ folder, originalName }) => {
    const ext = path.extname(originalName || "");
    const filename = `${crypto.randomUUID()}${ext}`;
    return path.posix.join(folder, filename);
};

const createClient = ({ region, accessKeyId, secretAccessKey, endpoint, forcePathStyle }) => {
    const config = {
        region: region || undefined,
        forcePathStyle: Boolean(forcePathStyle)
    };

    if (endpoint) {
        config.endpoint = endpoint;
    }

    if (accessKeyId && secretAccessKey) {
        config.credentials = { accessKeyId, secretAccessKey };
    }

    return new S3Client(config);
};

const buildPublicUrl = ({ baseUrl, bucket, region, key }) => {
    if (baseUrl) {
        return `${baseUrl.replace(/\/$/, "")}/${key}`;
    }

    if (region) {
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return `https://${bucket}.s3.amazonaws.com/${key}`;
};

export const createS3StorageDriver = ({ bucket, region, accessKeyId, secretAccessKey, endpoint, baseUrl, forcePathStyle }) => {
    if (!bucket) {
        throw new Error("S3 bucket is required for s3 storage driver.");
    }

    const client = createClient({ region, accessKeyId, secretAccessKey, endpoint, forcePathStyle });

    return {
        async save({ folder, originalName, buffer, mimeType }) {
            const key = buildKey({ folder, originalName });
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType || undefined
            });

            await client.send(command);

            return {
                key,
                url: buildPublicUrl({ baseUrl, bucket, region, key }),
                size: buffer?.length ?? 0
            };
        }
    };
};
