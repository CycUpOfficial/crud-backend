import { createLocalStorageDriver } from "./drivers/local.driver.js";
import { createS3StorageDriver } from "./drivers/s3.driver.js";

const driverFactories = new Map([
    ["local", createLocalStorageDriver],
    ["s3", createS3StorageDriver]
]);

export const createStorageDriver = (config) => {
    const factory = driverFactories.get(config.driver);
    if (!factory) {
        throw new Error(`Unsupported storage driver: ${config.driver}`);
    }

    return factory(config[config.driver]);
};
