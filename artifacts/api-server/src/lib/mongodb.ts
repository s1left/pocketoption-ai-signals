import mongoose from "mongoose";
import { logger } from "./logger";

let connected = false;

export async function connectMongo(): Promise<void> {
  if (connected) return;
  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI env variable is required");
  await mongoose.connect(uri, {
    dbName: "pocketai",
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });
  connected = true;
  logger.info("MongoDB connected");
}
