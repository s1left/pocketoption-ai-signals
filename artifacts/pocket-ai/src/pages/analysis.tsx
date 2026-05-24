import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Zap, TrendingUp, AlertTriangle, Crosshair } from "lucide-react";
import { useGetHistory } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";

export default function Analysis() {
  const { traderId } = useAuth();
  const { data: history } = useGetHistory({ userId: traderId || "", limit: 50 }, { query: { enabled: !!traderId, queryKey: ['history-analysis', traderId] } });

  // Generate some mock chart data based on history or fake it for visual impact
  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    volatility: Math.floor(Math.random() * 100),
    volume: Math.floor(Math.random() * 500) + 100
  }));

  const patterns = [
    { name: "Bullish Engulfing", pair: "EUR/USD (OTC)", strength: 87, time: "2m ago" },
    { name: "RSI Divergence", pair: "GBP/JPY", strength: 92, time: "5m ago" },
    { name: "Double Bottom", pair: "BTC/USDT", strength: 78, time: "12m ago" },
    { name: "MACD Cross", pair: "AUD/CAD (OTC)", strength: 84, time: "15m ago" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Activity className="text-primary w-8 h-8" />
        <h1 className="text-3xl font-orbitron font-bold tracking-widest text-foreground">
          MARKET <span className="text-primary">ANALYSIS</span>
        </h1>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "GLOBAL VOLATILITY", value: "HIGH", icon: <AlertTriangle className="text-yellow-500" />, color: "text-yellow-500" },
          { label: "ACTIVE OPPORTUNITIES", value: "12", icon: <TargetIcon className="text-primary" />, color: "text-primary" },
          { label: "TREND STRENGTH", value: "84%", icon: <TrendingUp className="text-green-500" />, color: "text-green-500" },
          { label: "NETWORK LATENCY", value: "42ms", icon: <Zap className="text-blue-500" />, color: "text-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 flex flex-col gap-2">
            <div className="text-xs font-mono text-muted-foreground tracking-widest flex items-center justify-between">
              {stat.label}
              {stat.icon}
            </div>
            <div className={`font-orbitron text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 flex flex-col gap-6 min-h-[400px]">
          <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="text-primary w-5 h-5" />
            VOLATILITY INDEX (VIX)
          </h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 0, fontFamily: 'monospace' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="volatility" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pattern Recognition */}
        <div className="bg-card border border-border p-6 flex flex-col gap-4">
          <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
            <Crosshair className="text-primary w-5 h-5" />
            PATTERN SCANNER
          </h2>
          <div className="space-y-3">
            {patterns.map((p, i) => (
              <div key={i} className="p-3 border border-border bg-background/50 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-orbitron font-bold text-sm group-hover:text-primary transition-colors">{p.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{p.time}</div>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">{p.pair}</span>
                  <span className={p.strength > 85 ? "text-green-500" : "text-yellow-500"}>
                    {p.strength}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
