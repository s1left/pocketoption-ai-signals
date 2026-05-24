import mongoose, { Schema, Document } from "mongoose";

export interface ISignalHistory extends Document {
  userId: string;
  currencyPair: string;
  action: "BUY" | "SELL";
  expiry: string;
  confidence: number;
  timestamp: number;
  result: "PENDING" | "WIN" | "LOSS";
  analysisExplanation: string | null;
  entryPrice: number | null;
}

const SignalHistorySchema = new Schema<ISignalHistory>({
  userId: { type: String, required: true, index: true },
  currencyPair: { type: String, required: true },
  action: { type: String, enum: ["BUY", "SELL"], required: true },
  expiry: { type: String, required: true },
  confidence: { type: Number, required: true },
  timestamp: { type: Number, required: true, default: () => Date.now() },
  result: { type: String, enum: ["PENDING", "WIN", "LOSS"], default: "PENDING" },
  analysisExplanation: { type: String, default: null },
  entryPrice: { type: Number, default: null },
});

export const SignalHistory =
  mongoose.models.SignalHistory ||
  mongoose.model<ISignalHistory>("SignalHistory", SignalHistorySchema);
