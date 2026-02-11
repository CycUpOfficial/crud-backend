import mongoose from "mongoose";
import { env } from "../config/env.js";

let isConnected = false;

export const connectMongo = async () => {
    if (isConnected) return;

    if (!env.mongo?.uri) {
        const error = new Error("MongoDB connection string is missing.");
        error.statusCode = 500;
        throw error;
    }

    await mongoose.connect(env.mongo.uri);
    isConnected = true;

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
    });
};
