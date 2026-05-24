import { randomUUID } from "crypto";

export interface FallbackUser {
  telegramId: string;
  username: string;
  hasAccess: boolean;
  status: "active" | "pending" | "blocked";
  createdAt: number;
  expiresAt: number | null;
}

export interface FallbackHistoryRecord {
  _id: string;
  userId: string;
  currencyPair: string;
  action: string;
  expiry: string;
  confidence: number;
  timestamp: number;
  result: string;
  analysisExplanation: string | null;
  entryPrice: number | null;
}

const users = new Map<string, FallbackUser>();
const history: FallbackHistoryRecord[] = [];

export async function getFallbackUser(telegramId: string) {
  const user = users.get(telegramId) ?? null;
  if (!user) return null;

  const now = Date.now();
  const effectiveHasAccess =
    user.hasAccess && (user.expiresAt === -1 || user.expiresAt === null || user.expiresAt > now);

  if (effectiveHasAccess !== user.hasAccess) {
    const updated: FallbackUser = {
      ...user,
      hasAccess: effectiveHasAccess,
      status: effectiveHasAccess ? "active" : "blocked",
    };
    users.set(telegramId, updated);
    return updated;
  }

  return user;
}

export async function upsertFallbackUser(data: {
  telegramId: string;
  username: string;
  hasAccess?: boolean;
  status?: "active" | "pending" | "blocked";
  expiresAt?: number | null;
}) {
  const existing = users.get(data.telegramId);
  const now = Date.now();
  const user: FallbackUser = {
    telegramId: data.telegramId,
    username: data.username,
    hasAccess: data.hasAccess ?? existing?.hasAccess ?? false,
    status: data.status ?? existing?.status ?? "pending",
    createdAt: existing?.createdAt ?? now,
    expiresAt: data.expiresAt ?? existing?.expiresAt ?? null,
  };
  users.set(data.telegramId, user);
  return user;
}

export async function listFallbackUsers() {
  const now = Date.now();
  const list = [...users.values()].map((u) => {
    const effectiveHasAccess =
      u.hasAccess && (u.expiresAt === -1 || u.expiresAt === null || u.expiresAt > now);
    if (effectiveHasAccess !== u.hasAccess) {
      const updated: FallbackUser = {
        ...u,
        hasAccess: effectiveHasAccess,
        status: effectiveHasAccess ? "active" : "blocked",
      };
      users.set(u.telegramId, updated);
      return updated;
    }
    return u;
  });

  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateFallbackUserAccess(
  telegramId: string,
  updates: {
    hasAccess: boolean;
    expiresAt?: number | null;
    status?: string;
  }
) {
  const existing = users.get(telegramId);
  if (!existing) return null;
  const updated: FallbackUser = {
    ...existing,
    hasAccess: updates.hasAccess,
    expiresAt: updates.expiresAt ?? existing.expiresAt,
    status:
      updates.status !== undefined
        ? (updates.status as FallbackUser["status"])
        : updates.hasAccess
        ? "active"
        : "blocked",
  };
  users.set(telegramId, updated);
  return updated;
}

export async function getUsersByIds(telegramIds: string[]) {
  return telegramIds
    .map((id) => users.get(id))
    .filter((user): user is FallbackUser => user !== undefined);
}

export async function getFallbackHistory(userId: string, limit?: number) {
  const records = history
    .filter((record) => record.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  return typeof limit === "number" ? records.slice(0, limit) : records;
}

export async function addFallbackHistoryRecord(data: {
  userId: string;
  currencyPair: string;
  action: string;
  expiry: string;
  confidence: number;
  timestamp?: number;
  result?: string;
  analysisExplanation?: string | null;
  entryPrice?: number | null;
}) {
  const record: FallbackHistoryRecord = {
    _id: randomUUID(),
    userId: data.userId,
    currencyPair: data.currencyPair,
    action: data.action,
    expiry: data.expiry,
    confidence: data.confidence,
    timestamp: data.timestamp ?? Date.now(),
    result: data.result ?? "PENDING",
    analysisExplanation: data.analysisExplanation ?? null,
    entryPrice: data.entryPrice ?? null,
  };
  history.push(record);
  return record;
}

export async function updateFallbackHistoryResult(
  id: string,
  result: string
) {
  const record = history.find((item) => item._id === id);
  if (!record) return null;
  record.result = result;
  return record;
}

export async function clearFallbackHistory(userId: string) {
  const before = history.length;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].userId === userId) {
      history.splice(i, 1);
    }
  }
  return { deletedCount: before - history.length };
}

export async function deleteFallbackHistoryForUser(userId: string) {
  const before = history.length;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].userId === userId) {
      history.splice(i, 1);
    }
  }
  return { deletedCount: before - history.length };
}

export async function getAllFallbackHistory() {
  return [...history];
}
