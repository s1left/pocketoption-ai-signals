import React, { useState, useRef } from "react";
import { TradingViewWidget } from "../components/tradingview-widget";
import { OTC_PAIRS, FOREX_PAIRS, CRYPTO_PAIRS, COMMODITIES_PAIRS, PAIR_TO_TV_SYMBOL, SignalRequestExpiry } from "../lib/constants";
import { useAuth } from "../hooks/use-auth";
import { usePriceTicker } from "../hooks/use-price-ticker";
import {
  useGenerateSignal,
  useSaveSignalToHistory,
  useUpdateSignalResult,
  useGetHistory,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, TrendingUp, Zap } from "lucide-react";

type Category = "OTC" | "FOREX" | "CRYPTO" | "COMM";

function PairSelector({ selected, onSelect }: { selected: string; onSelect: (p: string) => void }) {
  const [cat, setCat] = useState<Category>("OTC");
  const pairs: Record<Category, string[]> = { OTC: OTC_PAIRS, FOREX: FOREX_PAIRS, CRYPTO: CRYPTO_PAIRS, COMM: COMMODITIES_PAIRS };
  return (
    <div className="flex flex-col glass rounded-xl border border-border overflow-hidden">
      <div className="flex w-full border-b border-border px-1.5 py-1.5 gap-1">
        {(["OTC", "FOREX", "CRYPTO", "COMM"] as Category[]).map(c => (
          <button key={c} onClick={() => setCat(c)} className={cn("flex-1 py-1 rounded-lg text-[10px] font-orbitron font-bold transition-colors", cat === c ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            {c}
          </button>
        ))}
      </div>
      <div className="max-h-48 overflow-y-auto">
        {pairs[cat].map(pair => (
          <button key={pair} onClick={() => onSelect(pair)} className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors text-left border-l-2",
            selected === pair ? "bg-primary/10 border-primary text-foreground" : "hover:bg-muted text-muted-foreground border-transparent"
          )}>
            <span>{pair}</span>
            {pair.includes("OTC") && <span className="text-[9px] text-purple-400 border border-purple-500/30 px-1 rounded">OTC</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { traderId } = useAuth();
  const [selectedPair, setSelectedPair] = useState("EUR/USD (OTC)");
  const [selectedExpiry, setSelectedExpiry] = useState<SignalRequestExpiry>("1m");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(true);
  const price = usePriceTicker(1.0850);
  const generateSignal = useGenerateSignal();
  const saveToHistory = useSaveSignalToHistory();
  const updateResult = useUpdateSignalResult();
  const { data: history, refetch: refetchHistory } = useGetHistory(
    { userId: traderId || "", limit: 10 },
    { query: { enabled: !!traderId, queryKey: ['history', traderId] } }
  );
  const [activeSignal, setActiveSignal] = useState<any>(null);
  const activeRef = useRef<any>(null);

  const handleGenerate = () => {
    if (!traderId) return;
    generateSignal.mutate({ data: { currencyPair: selectedPair, expiry: selectedExpiry, userId: traderId, currentPrice: price } }, {
      onSuccess: (signal) => {
        const s = { ...signal, entryPrice: price, timestamp: Date.now() };
        setActiveSignal(s); activeRef.current = s;
        saveToHistory.mutate({ data: { userId: traderId, currencyPair: signal.currencyPair, action: signal.action as any, expiry: signal.expiry, confidence: signal.confidence, timestamp: Date.now(), analysisExplanation: signal.analysisExplanation, entryPrice: price } }, {
          onSuccess: (item) => {
            refetchHistory();
            const sec = selectedExpiry === "30s" ? 30 : parseInt(selectedExpiry) * 60;
            setTimeout(() => {
              const win = Math.random() < (signal.confidence / 100);
              updateResult.mutate({ id: item._id, data: { result: win ? "WIN" : "LOSS" } }, { onSuccess: () => { refetchHistory(); setActiveSignal(null); activeRef.current = null; } });
            }, sec * 1000);
          }
        });
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-3">

        {/* Pair header (mobile tap to open) */}
        <div onClick={() => setSelectorOpen(v => !v)} className="glass border border-border rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer select-none">
          <div className="font-orbitron font-bold text-sm text-foreground leading-tight">{selectedPair}</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{price.toFixed(5)}
            </span>
            {selectorOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {selectorOpen && (
          <PairSelector selected={selectedPair} onSelect={(p) => { setSelectedPair(p); setSelectorOpen(false); }} />
        )}

        {/* Expiry */}
        <div className="glass border border-border px-4 py-3 rounded-xl">
          <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest mb-2">Экспирация</p>
          <div className="grid grid-cols-4 gap-1.5">
            {(["30s", "1m", "2m", "5m"] as const).map(exp => (
              <button key={exp} onClick={() => setSelectedExpiry(exp)} className={cn(
                "h-9 rounded-lg font-orbitron font-bold text-xs uppercase transition-all",
                selectedExpiry === exp ? "bg-primary text-white glow-red" : "bg-black/40 text-muted-foreground border border-border hover:border-primary/50"
              )}>
                {exp}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleGenerate}
          disabled={generateSignal.isPending || !!activeSignal}
          className={cn(
            "w-full h-12 font-orbitron font-bold text-base tracking-widest rounded-xl transition-all",
            generateSignal.isPending
              ? "bg-primary/50 text-white cursor-not-allowed animate-pulse"
              : !!activeSignal
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-white glow-red active:scale-95"
          )}
        >
          {generateSignal.isPending ? "ВЫЧИСЛЯЮ..." : !!activeSignal ? "ОЖИДАНИЕ..." : "АНАЛИЗИРОВАТЬ"}
        </button>

        {/* Signal result card */}
        {activeSignal && (
          <div className={cn("rounded-xl border p-4 flex flex-col gap-3 animate-in fade-in glass", activeSignal.action === "BUY" ? "border-green-500/40 glow-green" : "border-primary/40 glow-red")}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">Сигнал</div>
                <div className={cn("font-orbitron text-4xl font-black", activeSignal.action === "BUY" ? "text-green-500" : "text-primary")}>
                  {activeSignal.action === "BUY" ? "▲ BUY" : "▼ SELL"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">Точность</div>
                <div className="font-orbitron text-2xl font-bold">{activeSignal.confidence}%</div>
              </div>
            </div>
            <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
              <div className={cn("h-full transition-all duration-1000", activeSignal.action === "BUY" ? "bg-green-500" : "bg-primary")} style={{ width: `${activeSignal.confidence}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 rounded-lg p-2.5 text-center border border-border">
                <div className="text-[9px] font-mono text-muted-foreground">ЭКСПИРАЦИЯ</div>
                <div className="font-orbitron font-bold text-lg">{activeSignal.expiry}</div>
              </div>
              <div className="bg-black/40 rounded-lg p-2.5 text-center border border-border">
                <div className="text-[9px] font-mono text-muted-foreground">ВХОД</div>
                <div className="font-mono font-bold text-primary">{activeSignal.entryPrice?.toFixed(5)}</div>
              </div>
            </div>
            {activeSignal.analysisExplanation && (
              <div className="text-[11px] font-mono leading-relaxed text-muted-foreground bg-black/40 p-2.5 rounded-lg border border-border border-l-2 border-l-primary">
                {activeSignal.analysisExplanation}
              </div>
            )}
          </div>
        )}

        {/* Mobile recent history */}
        <div className="lg:hidden">
          <h3 className="font-orbitron text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Последние сделки</h3>
          <div className="space-y-1.5">
            {history?.slice(0, 3).map((item) => (
              <div key={item._id} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-border">
                <div>
                  <div className="font-orbitron text-xs font-bold">{item.currencyPair}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </div>
                <span className={cn("font-orbitron text-xs font-bold", item.action === "BUY" ? "text-green-500" : "text-primary")}>{item.action}</span>
                <Badge variant="outline" className={cn("font-mono text-[9px]", item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/30" : item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30")}>
                  {item.result}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Desktop) ── */}
      <div className="hidden lg:flex flex-1 flex-col gap-3 min-w-0">
        <div className="glass border border-border rounded-xl flex-1 min-h-[460px] overflow-hidden">
          <TradingViewWidget symbol={PAIR_TO_TV_SYMBOL[selectedPair] || "FX:EURUSD"} />
        </div>

        <div className="glass border border-border rounded-xl p-4 h-[220px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-orbitron text-sm font-bold flex items-center gap-2">
              <TrendingUp className="text-primary w-4 h-4" /> HISTORY LOG
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {history?.map((item) => (
              <div key={item._id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-black/40 text-xs">
                <span className="font-orbitron font-bold w-28 truncate">{item.currencyPair}</span>
                <span className={cn("font-orbitron font-bold w-12", item.action === "BUY" ? "text-green-500" : "text-primary")}>{item.action}</span>
                <span className="font-mono text-muted-foreground w-8">{item.expiry}</span>
                <span className="font-mono font-bold w-10">{item.confidence}%</span>
                <span className="font-mono text-muted-foreground flex-1">{new Date(item.timestamp).toLocaleTimeString()}</span>
                <Badge variant="outline" className={cn("font-mono text-[9px]", item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/30" : item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30")}>
                  {item.result}
                </Badge>
              </div>
            ))}
            {(!history || history.length === 0) && (
              <div className="text-center py-6 text-muted-foreground font-mono text-xs border border-dashed border-border rounded-lg">
                ОЖИДАНИЕ СИГНАЛОВ...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE CHART (collapsible) ── */}
      <div className="lg:hidden flex flex-col gap-2">
        <button onClick={() => setChartOpen(v => !v)} className="glass border border-border rounded-xl px-4 py-2.5 flex items-center justify-between w-full">
          <span className="font-orbitron text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" /> График ({PAIR_TO_TV_SYMBOL[selectedPair]?.split(":")[1] || selectedPair})
          </span>
          {chartOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {chartOpen && (
          <div className="glass border border-border rounded-xl overflow-hidden h-64">
            <TradingViewWidget symbol={PAIR_TO_TV_SYMBOL[selectedPair] || "FX:EURUSD"} />
          </div>
        )}
      </div>

    </div>
  );
}
