import React, { useState } from "react";
import { useGetHistory, useGetUserStats, useClearUserHistory } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";
import { History, TrendingUp, TrendingDown, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { traderId } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const { data: history, refetch } = useGetHistory({ userId: traderId || "", limit: 100 }, {
    query: {
      enabled: !!traderId,
      refetchInterval: 30000,
      queryKey: ['history', traderId]
    }
  });
  const { data: stats } = useGetUserStats(traderId || "", { query: { enabled: !!traderId, queryKey: ['stats', traderId] } });
  const clearHistory = useClearUserHistory();

  const handleClear = () => {
    if (!traderId) return;
    if (!confirming) { setConfirming(true); return; }
    clearHistory.mutate({ params: { userId: traderId } }, {
      onSuccess: () => { refetch(); setConfirming(false); }
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <History className="text-primary w-6 h-6" />
          <h1 className="text-xl font-orbitron font-bold tracking-widest text-foreground">
            SIGNAL <span className="text-primary">HISTORY</span>
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={clearHistory.isPending || !history?.length}
          className={`font-orbitron text-xs tracking-wider h-8 ${confirming ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {confirming ? "ПОДТВЕРДИТЬ?" : "ОЧИСТИТЬ"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "WIN RATE", value: stats?.winRate ? `${stats.winRate.toFixed(1)}%` : "0%", color: "text-primary" },
          { label: "WINS", value: stats?.wins || 0, color: "text-green-500", icon: <TrendingUp className="w-3.5 h-3.5 text-green-500" /> },
          { label: "LOSSES", value: stats?.losses || 0, color: "text-red-500", icon: <TrendingDown className="w-3.5 h-3.5 text-red-500" /> },
          { label: "PENDING", value: stats?.pending || 0, color: "text-yellow-500", icon: <Clock className="w-3.5 h-3.5 text-yellow-500" /> },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border p-4 flex flex-col gap-1 rounded-lg">
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest flex items-center gap-1">{s.icon}{s.label}</div>
            <div className={`font-orbitron text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 border-b border-border bg-muted/20 text-[10px] font-mono tracking-widest text-muted-foreground">
          <div className="col-span-2">АКТИВ / ВРЕМЯ</div>
          <div>СДЕЛКА</div>
          <div>ЭКСПИРАЦИЯ</div>
          <div className="text-right">РЕЗУЛЬТАТ</div>
        </div>

        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {history?.map((item) => (
            <div key={item._id} className="grid grid-cols-5 px-4 py-3 items-center hover:bg-background/50 transition-colors">
              <div className="col-span-2">
                <div className="font-orbitron font-bold text-sm text-foreground">{item.currencyPair}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</div>
              </div>
              <div className={`font-orbitron font-bold text-sm ${item.action === "BUY" ? "text-green-500" : "text-red-500"}`}>
                {item.action === "BUY" ? "▲ BUY" : "▼ SELL"}
              </div>
              <div className="text-xs font-mono text-muted-foreground">{item.expiry} · {item.confidence}%</div>
              <div className="text-right">
                <Badge variant="outline" className={`font-mono text-[10px] tracking-widest ${
                  item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }`}>
                  {item.result}
                </Badge>
              </div>
            </div>
          ))}
          {(!history || history.length === 0) && (
            <div className="p-10 text-center text-muted-foreground font-mono text-sm">
              НЕТ ИСТОРИИ СДЕЛОК
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
