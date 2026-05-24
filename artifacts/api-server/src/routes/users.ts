import { Router } from "express";
import { User } from "../models/User";
import {
  GetUserParams,
  CreateOrUpdateUserBody,
  UpdateUserAccessParams,
  UpdateUserAccessBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/users/:userId", async (req, res) => {
  const parse = GetUserParams.safeParse(req.params);
  if (!parse.success) return res.status(400).json({ error: "Invalid params" });

  const user = await User.findOne({ telegramId: parse.data.userId }).lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    telegramId: user.telegramId,
    username: user.username,
    hasAccess: user.hasAccess,
    status: user.status,
    createdAt: user.createdAt,
    expiresAt: user.expiresAt ?? null,
  });
});

router.post("/users", async (req, res) => {
  const parse = CreateOrUpdateUserBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { telegramId, username, hasAccess, status, expiresAt } = parse.data;

  const user = await User.findOneAndUpdate(
    { telegramId },
    {
      $set: {
        username,
        ...(hasAccess != null ? { hasAccess } : {}),
        ...(status != null ? { status } : {}),
        ...(expiresAt != null ? { expiresAt } : {}),
      },
      $setOnInsert: { createdAt: Date.now() },
    },
    { upsert: true, new: true }
  ).lean();

  return res.json({
    telegramId: user!.telegramId,
    username: user!.username,
    hasAccess: user!.hasAccess,
    status: user!.status,
    createdAt: user!.createdAt,
    expiresAt: user!.expiresAt ?? null,
  });
});

router.get("/admin/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json(
    users.map((u) => ({
      telegramId: u.telegramId,
      username: u.username,
      hasAccess: u.hasAccess,
      status: u.status,
      createdAt: u.createdAt,
      expiresAt: u.expiresAt ?? null,
    }))
  );
});

router.patch("/admin/users/:userId/access", async (req, res) => {
  const paramsParse = UpdateUserAccessParams.safeParse(req.params);
  const bodyParse = UpdateUserAccessBody.safeParse(req.body);
  if (!paramsParse.success || !bodyParse.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { userId } = paramsParse.data;
  const { hasAccess, expiresAt, status } = bodyParse.data;

  const user = await User.findOneAndUpdate(
    { telegramId: userId },
    {
      $set: {
        hasAccess,
        ...(expiresAt != null ? { expiresAt } : {}),
        ...(status != null ? { status } : { status: hasAccess ? "active" : "blocked" }),
      },
    },
    { new: true }
  ).lean();

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    telegramId: user.telegramId,
    username: user.username,
    hasAccess: user.hasAccess,
    status: user.status,
    createdAt: user.createdAt,
    expiresAt: user.expiresAt ?? null,
  });
});

export default router;
