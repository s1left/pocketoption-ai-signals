import { Router } from "express";
import { SignalHistory } from "../models/SignalHistory";
import { User } from "../models/User";
import { isMongoConnected } from "../lib/mongodb";
import { getAllFallbackHistory, getUsersByIds } from "../lib/fallback-db";
import { GetUserStatsParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats/:userId", async (req, res) => {
  const parse = GetUserStatsParams.safeParse(req.params);
  if (!parse.success) return res.status(400).json({ error: "Invalid params" });

  const { userId } = parse.data;

  if (!isMongoConnected()) {
    const records = await getAllFallbackHistory();
    const filtered = records.filter((r) => r.userId === userId);
    const wins = filtered.filter((r) => r.result === "WIN").length;
    const losses = filtered.filter((r) => r.result === "LOSS").length;
    const pending = filtered.filter((r) => r.result === "PENDING").length;
    const total = filtered.length;
    const decided = wins + losses;
    const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;
    return res.json({ userId, total, wins, losses, pending, winRate });
  }

  const records = await SignalHistory.find({ userId }).lean();

  const wins = records.filter((r) => r.result === "WIN").length;
  const losses = records.filter((r) => r.result === "LOSS").length;
  const pending = records.filter((r) => r.result === "PENDING").length;
  const total = records.length;
  const decided = wins + losses;
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;

  return res.json({ userId, total, wins, losses, pending, winRate });
});

router.get("/stats/leaderboard", async (_req, res) => {
  if (!isMongoConnected()) {
    const rows = await getAllFallbackHistory();
    const grouped = rows.reduce((acc, record) => {
      if (record.result !== "WIN" && record.result !== "LOSS") return acc;
      const entry = acc.get(record.userId) ?? { userId: record.userId, wins: 0, total: 0 };
      entry.total += 1;
      if (record.result === "WIN") entry.wins += 1;
      acc.set(record.userId, entry);
      return acc;
    }, new Map<string, { userId: string; wins: number; total: number }>());

    const stats = Array.from(grouped.values()).map((entry) => ({
      userId: entry.userId,
      wins: entry.wins,
      total: entry.total,
      winRate: Math.round((entry.wins / entry.total) * 1000) / 10,
    }));

    stats.sort((a, b) => b.winRate - a.winRate);
    const top = stats.slice(0, 20);
    const users = await getUsersByIds(top.map((r) => r.userId));
    const userMap = new Map(users.map((u) => [u.telegramId, u.username]));

    return res.json(
      top.map((r) => ({
        userId: r.userId,
        username: userMap.get(r.userId) ?? r.userId,
        winRate: r.winRate,
        total: r.total,
      }))
    );
  }

  const pipeline = [
    { $match: { result: { $in: ["WIN", "LOSS"] } } },
    {
      $group: {
        _id: "$userId",
        wins: { $sum: { $cond: [{ $eq: ["$result", "WIN"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        userId: "$_id",
        wins: 1,
        total: 1,
        winRate: {
          $round: [{ $multiply: [{ $divide: ["$wins", "$total"] }, 100] }, 1],
        },
      },
    },
    { $sort: { winRate: -1 } },
    { $limit: 20 },
  ];

  const rows = await SignalHistory.aggregate(pipeline);

  const userIds = rows.map((r) => r.userId);
  const users = await User.find({ telegramId: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u.telegramId, u.username]));

  return res.json(
    rows.map((r) => ({
      userId: r.userId,
      username: userMap.get(r.userId) ?? r.userId,
      winRate: r.winRate,
      total: r.total,
    }))
  );
});

export default router;
