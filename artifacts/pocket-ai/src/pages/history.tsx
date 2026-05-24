import React from "react";
import { useGetHistory, useGetUserStats } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";
import { History, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { traderId } = useAuth();
  const { data: history } = useGetHistory({ userId: traderId || "", limit: 100 }, { 
    query: { 
      enabled: !!traderId,
      refetchInterval: 30000 // Auto-refresh every 30s
    } 
  });
  const { data: stats } = useGetUserStats(traderId || "", { query: { enabled: !!traderId } });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <History className="text-primary w-8 h-8" />
        <h1 className="text-3xl font-orbitron font-bold tracking-widest text-foreground">
          SIGNAL <span className="text-primary">HISTORY</span>
        </h1>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-mono text-muted-foreground tracking-widest mb-2">WIN RATE</div>
          <div className="font-orbitron text-4xl font-bold text-primary">
            {stats?.winRate ? `${stats.winRate.toFixed(1)}%` : "0.0%"}
          </div>
        </div>
        <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-mono text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-500"/> WINS</div>
          <div className="font-orbitron text-3xl font-bold text-green-500">
            {stats?.wins || 0}
          </div>
        </div>
        <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-mono text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-500"/> LOSSES</div>
          <div className="font-orbitron text-3xl font-bold text-red-500">
            {stats?.losses || 0}
          </div>
        </div>
        <div className="bg-card border border-border p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-mono text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><Clock className="w-4 h-4 text-yellow-500"/> PENDING</div>
          <div className="font-orbitron text-3xl font-bold text-yellow-500">
            {stats?.pending || 0}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-card border border-border">
        <div className="grid grid-cols-6 p-4 border-b border-border bg-muted/20 text-xs font-mono tracking-widest text-muted-foreground">
          <div className="col-span-2">ASSET / TIME</div>
          <div>ACTION</div>
          <div>EXPIRY / CONF</div>
          <div>ENTRY PRICE</div>
          <div className="text-right">RESULT</div>
        </div>
        
        <div className="divide-y divide-border">
          {history?.map((item) => (
            <div key={item._id} className="grid grid-cols-6 p-4 items-center hover:bg-background/50 transition-colors">
              <div className="col-span-2 flex flex-col gap-1">
                <div className="font-orbitron font-bold text-foreground">{item.currencyPair}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className={`font-orbitron font-bold ${
                item.action === "BUY" ? "text-green-500" : "text-red-500"
              }`}>
                {item.action}
              </div>
              
              <div className="text-sm font-mono text-muted-foreground">
                {item.expiry} | {item.confidence}%
              </div>

              <div className="text-sm font-mono text-foreground">
                {item.entryPrice ? item.entryPrice.toFixed(5) : "---"}
              </div>
              
              <div className="text-right">
                <Badge variant="outline" className={`font-mono tracking-widest px-3 py-1 ${
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
            <div className="p-12 text-center text-muted-foreground font-mono">
              NO TRADING HISTORY FOUND
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
