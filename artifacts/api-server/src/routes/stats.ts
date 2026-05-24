import { Router } from "express";
import { SignalHistory } from "../models/SignalHistory";
import { User } from "../models/User";
import { GetUserStatsParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats/:userId", async (req, res) => {
  const parse = GetUserStatsParams.safeParse(req.params);
  if (!parse.success) return res.status(400).json({ error: "Invalid params" });

  const { userId } = parse.data;
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
