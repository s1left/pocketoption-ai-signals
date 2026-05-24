import mongoose from "mongoose";
import { logger } from "./logger";

let connected = false;

export async function connectMongo(): Promise<void> {
  if (connected) return;

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    logger.warn(
      "MONGODB_URI is not configured. Using local in-memory fallback for users and history.",
    );
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: "pocketai",
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    connected = true;
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB — using local fallback");
  }
}

export function isMongoConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}
