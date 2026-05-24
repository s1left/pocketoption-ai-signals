import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  telegramId: string;
  username: string;
  hasAccess: boolean;
  status: "active" | "pending" | "blocked";
  createdAt: number;
  expiresAt: number;
}

const UserSchema = new Schema<IUser>({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  hasAccess: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "pending", "blocked"], default: "pending" },
  createdAt: { type: Number, default: () => Date.now() },
  expiresAt: { type: Number, default: 0 },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
