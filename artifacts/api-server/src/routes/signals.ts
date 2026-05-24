import { Router } from "express";
import { generateTradingSignal } from "../lib/groq";
import {
  GenerateSignalBody,
  GenerateBatchSignalsBody,
} from "@workspace/api-zod";

const router = Router();

router.post("/signals/generate", async (req, res) => {
  const parse = GenerateSignalBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { currencyPair, expiry, currentPrice } = parse.data;

  const result = await generateTradingSignal(currencyPair, expiry, currentPrice);

  return res.json({
    action: result.action,
    confidence: result.confidence,
    currencyPair,
    expiry,
    analysisExplanation: result.analysisExplanation,
    isOtc: currencyPair.includes("(OTC)"),
    rsiStatus: result.rsiStatus ?? null,
    trendStrength: result.trendStrength ?? null,
  });
});

router.post("/signals/batch", async (req, res) => {
  const parse = GenerateBatchSignalsBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { pairs, expiry } = parse.data;

  const results = await Promise.all(
    pairs.map(async (pair) => {
      const result = await generateTradingSignal(pair, expiry, null);
      return {
        action: result.action,
        confidence: result.confidence,
        currencyPair: pair,
        expiry,
        analysisExplanation: result.analysisExplanation,
        isOtc: pair.includes("(OTC)"),
        rsiStatus: result.rsiStatus ?? null,
        trendStrength: result.trendStrength ?? null,
      };
    })
  );

  return res.json(results);
});

export default router;
