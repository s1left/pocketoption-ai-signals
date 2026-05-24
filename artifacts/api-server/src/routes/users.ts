import { Router } from "express";
import { User } from "../models/User";
import { isMongoConnected } from "../lib/mongodb";
import {
  getFallbackUser,
  listFallbackUsers,
  upsertFallbackUser,
  updateFallbackUserAccess,
} from "../lib/fallback-db";
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

  const now = Date.now();

  if (!isMongoConnected()) {
    const user = await getFallbackUser(parse.data.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const effectiveHasAccess =
      user.hasAccess && (user.expiresAt === -1 || user.expiresAt === null || user.expiresAt > now);

    if (effectiveHasAccess !== user.hasAccess) {
      // update fallback record to reflect expired access
      await updateFallbackUserAccess(user.telegramId, {
        hasAccess: effectiveHasAccess,
        expiresAt: user.expiresAt,
        status: effectiveHasAccess ? "active" : "blocked",
      });
      user.hasAccess = effectiveHasAccess;
      user.status = effectiveHasAccess ? "active" : "blocked";
    }

    return res.json(user);
  }

  const user = await User.findOne({ telegramId: parse.data.userId }).lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  const effectiveHasAccess =
    user.hasAccess && (user.expiresAt === -1 || user.expiresAt === undefined || user.expiresAt === null || user.expiresAt > now);

  if (effectiveHasAccess !== user.hasAccess) {
    // persist change if access expired
    await User.findOneAndUpdate(
      { telegramId: user.telegramId },
      { hasAccess: effectiveHasAccess, status: effectiveHasAccess ? "active" : "blocked" }
    );
  }

  return res.json({
    telegramId: user.telegramId,
    username: user.username,
    hasAccess: effectiveHasAccess,
    status: effectiveHasAccess ? user.status : "blocked",
    createdAt: user.createdAt,
    expiresAt: user.expiresAt ?? null,
  });
});

router.post("/users", async (req, res) => {
  const parse = CreateOrUpdateUserBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { telegramId, username, hasAccess, status, expiresAt } = parse.data;

  if (!isMongoConnected()) {
    const user = await upsertFallbackUser({
      telegramId,
      username,
      hasAccess,
      status,
      expiresAt,
    });
    return res.json(user);
  }

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
  const now = Date.now();

  if (!isMongoConnected()) {
    const list = await listFallbackUsers();
    return res.json(
      list.map((u) => ({
        telegramId: u.telegramId,
        username: u.username,
        hasAccess: u.hasAccess && (u.expiresAt === -1 || u.expiresAt === null || u.expiresAt > now),
        status: u.status,
        createdAt: u.createdAt,
        expiresAt: u.expiresAt ?? null,
      }))
    );
  }

  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json(
    users.map((u) => ({
      telegramId: u.telegramId,
      username: u.username,
      hasAccess: u.hasAccess && (u.expiresAt === -1 || u.expiresAt === undefined || u.expiresAt === null || u.expiresAt > now),
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

  if (!isMongoConnected()) {
    const user = await updateFallbackUserAccess(userId, {
      hasAccess,
      expiresAt,
      status,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  }

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
