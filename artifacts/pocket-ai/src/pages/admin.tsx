import React, { useState } from "react";
import { useGetAllUsers, useUpdateUserAccess, useClearUserHistoryAdmin } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";
import { ShieldAlert, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Admin() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [clearingId, setClearingId] = useState<string | null>(null);
  const { data: users, refetch, isFetching } = useGetAllUsers({ query: { queryKey: ['admin-users'], enabled: isAdmin, refetchInterval: 10000 } });
  const updateAccess = useUpdateUserAccess();
  const clearHistory = useClearUserHistoryAdmin();

  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const handleGrant = (userId: string, hours?: number) => {
    const expiresAt = hours ? Date.now() + hours * 60 * 60 * 1000 : undefined;
    updateAccess.mutate({ userId, data: { hasAccess: true, status: "active", ...(expiresAt ? { expiresAt } : {}) } }, { onSuccess: () => refetch() });
  };

  const handleRevoke = (userId: string) => {
    updateAccess.mutate({ userId, data: { hasAccess: false, status: "blocked" } }, { onSuccess: () => refetch() });
  };

  const handleClearHistory = (userId: string) => {
    if (clearingId === userId) {
      clearHistory.mutate({ userId }, { onSuccess: () => setClearingId(null) });
    } else {
      setClearingId(userId);
      setTimeout(() => setClearingId(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-primary w-6 h-6" />
          <h1 className="text-xl font-orbitron font-bold tracking-widest">
            ADMIN <span className="text-primary">PANEL</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
            {users?.length || 0} USERS
          </Badge>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-4 py-2.5 border-b border-border bg-muted/20 text-[10px] font-mono tracking-widest text-muted-foreground">
          <div className="col-span-3">TELEGRAM ID</div>
          <div className="col-span-2">СТАТУС</div>
          <div className="col-span-2">ДОСТУП</div>
          <div className="col-span-2">ИСТЕКАЕТ</div>
          <div className="col-span-3 text-right">ДЕЙСТВИЯ</div>
        </div>

        <div className="divide-y divide-border">
          {users?.map((user) => {
            const expired = user.expiresAt && user.expiresAt < Date.now();
            return (
              <div key={user.telegramId} className="px-4 py-3 hover:bg-background/50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center">
                  <div className="md:col-span-3">
                    <div className="font-mono font-bold text-sm text-foreground">{user.telegramId}</div>
                    {user.username && user.username !== user.telegramId && (
                      <div className="text-[10px] text-muted-foreground font-mono">@{user.username}</div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase ${
                      user.status === "active" && !expired ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      user.status === "blocked" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }`}>
                      {expired ? "EXPIRED" : user.status}
                    </Badge>
                  </div>

                  <div className="md:col-span-2">
                    {user.hasAccess && !expired ? (
                      <span className="flex items-center gap-1 text-green-500 font-mono text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> ДА
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-mono text-xs">
                        <XCircle className="w-3.5 h-3.5" /> НЕТ
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2 text-xs font-mono text-muted-foreground flex items-center gap-1">
                    {user.expiresAt ? (
                      <>
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className={expired ? "text-red-400" : ""}>{new Date(user.expiresAt).toLocaleDateString("ru-RU")}</span>
                      </>
                    ) : user.hasAccess ? "∞ Бессрочно" : "—"}
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-1.5 md:justify-end">
                    {(!user.hasAccess || expired) ? (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-orbitron tracking-wider border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white px-2" onClick={() => handleGrant(user.telegramId, 24)}>24ч</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-orbitron tracking-wider border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white px-2" onClick={() => handleGrant(user.telegramId, 24 * 30)}>30д</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-orbitron tracking-wider border-primary/50 text-primary hover:bg-primary hover:text-white px-2" onClick={() => handleGrant(user.telegramId)}>∞</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-orbitron tracking-wider border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white px-2" onClick={() => handleRevoke(user.telegramId)} disabled={updateAccess.isPending}>
                        REVOKE
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-7 text-[10px] font-orbitron tracking-wider px-2 ${clearingId === user.telegramId ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white animate-pulse" : "border-border text-muted-foreground hover:border-red-500 hover:text-red-500"}`}
                      onClick={() => handleClearHistory(user.telegramId)}
                      disabled={clearHistory.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {clearingId === user.telegramId ? "ТОЧНО?" : "LOG"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {(!users || users.length === 0) && (
            <div className="p-10 text-center text-muted-foreground font-mono text-sm">
              НЕТ ЗАРЕГИСТРИРОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
