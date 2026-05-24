import { Router } from "express";
import { SignalHistory } from "../models/SignalHistory";
import {
  GetHistoryQueryParams,
  SaveSignalToHistoryBody,
  UpdateSignalResultParams,
  UpdateSignalResultBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/history", async (req, res) => {
  const parse = GetHistoryQueryParams.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: "userId is required" });
  }
  const { userId, limit } = parse.data;

  const records = await SignalHistory.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit ?? 50)
    .lean();

  return res.json(
    records.map((r) => ({
      _id: String(r._id),
      userId: r.userId,
      currencyPair: r.currencyPair,
      action: r.action,
      expiry: r.expiry,
      confidence: r.confidence,
      timestamp: r.timestamp,
      result: r.result,
      analysisExplanation: r.analysisExplanation ?? null,
      entryPrice: r.entryPrice ?? null,
    }))
  );
});

router.post("/history", async (req, res) => {
  const parse = SaveSignalToHistoryBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid body" });
  }

  const doc = await SignalHistory.create({
    ...parse.data,
    result: "PENDING",
    timestamp: parse.data.timestamp ?? Date.now(),
  });

  return res.status(201).json({
    _id: String(doc._id),
    userId: doc.userId,
    currencyPair: doc.currencyPair,
    action: doc.action,
    expiry: doc.expiry,
    confidence: doc.confidence,
    timestamp: doc.timestamp,
    result: doc.result,
    analysisExplanation: doc.analysisExplanation ?? null,
    entryPrice: doc.entryPrice ?? null,
  });
});

router.patch("/history/:id/result", async (req, res) => {
  const paramsParse = UpdateSignalResultParams.safeParse(req.params);
  const bodyParse = UpdateSignalResultBody.safeParse(req.body);

  if (!paramsParse.success || !bodyParse.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { id } = paramsParse.data;
  const { result } = bodyParse.data;

  const doc = await SignalHistory.findByIdAndUpdate(
    id,
    { result },
    { new: true }
  ).lean();

  if (!doc) return res.status(404).json({ error: "Not found" });

  return res.json({
    _id: String(doc._id),
    userId: doc.userId,
    currencyPair: doc.currencyPair,
    action: doc.action,
    expiry: doc.expiry,
    confidence: doc.confidence,
    timestamp: doc.timestamp,
    result: doc.result,
    analysisExplanation: doc.analysisExplanation ?? null,
    entryPrice: doc.entryPrice ?? null,
  });
});

export default router;
