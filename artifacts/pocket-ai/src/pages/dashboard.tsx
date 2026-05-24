import React, { useState, useEffect, useRef } from "react";
import { TradingViewWidget } from "../components/tradingview-widget";
import { OTC_PAIRS, FOREX_PAIRS, CRYPTO_PAIRS, COMMODITIES_PAIRS, PAIR_TO_TV_SYMBOL, SignalRequestExpiry, BatchSignalRequestExpiry } from "../lib/constants";
import { useAuth } from "../hooks/use-auth";
import { usePriceTicker } from "../hooks/use-price-ticker";
import { 
  useGenerateSignal, 
  useGenerateBatchSignals, 
  useSaveSignalToHistory,
  useUpdateSignalResult,
  useGetHistory 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Target, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Category = "OTC" | "FOREX" | "CRYPTO" | "COMMODITIES";

interface PairSelectorProps {
  selected: string;
  onSelect: (pair: string) => void;
}

function PairSelector({ selected, onSelect }: PairSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("OTC");
  
  const getPairs = () => {
    switch(activeCategory) {
      case "OTC": return OTC_PAIRS;
      case "FOREX": return FOREX_PAIRS;
      case "CRYPTO": return CRYPTO_PAIRS;
      case "COMMODITIES": return COMMODITIES_PAIRS;
    }
  };

  const categories: Category[] = ["OTC", "FOREX", "CRYPTO", "COMMODITIES"];

  return (
    <div className="w-full flex flex-col glass rounded-xl border border-border overflow-hidden">
      <div className="flex w-full overflow-x-auto no-scrollbar border-b border-border p-2 gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-orbitron font-bold whitespace-nowrap transition-colors",
              activeCategory === cat ? "bg-primary text-primary-foreground glow-red" : "bg-black/20 text-muted-foreground hover:bg-black/40"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto w-full">
        {getPairs().map(pair => {
          const isSelected = selected === pair;
          const isOtc = pair.includes("OTC");
          return (
            <button
              key={pair}
              onClick={() => onSelect(pair)}
              className={cn(
                "w-full flex items-center justify-between p-3 text-sm font-mono transition-colors text-left",
                isSelected ? "bg-primary/10 border-l-2 border-primary text-foreground" : "hover:bg-muted text-muted-foreground border-l-2 border-transparent"
              )}
            >
              <span>{pair}</span>
              {isOtc && <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">OTC</Badge>}
            </button>
          )
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { traderId } = useAuth();
  const [selectedPair, setSelectedPair] = useState("EUR/USD (OTC)");
  const [selectedExpiry, setSelectedExpiry] = useState<SignalRequestExpiry>("1m");
  const [selectorOpen, setSelectorOpen] = useState(false);
  
  const price = usePriceTicker(1.0850);
  const generateSignal = useGenerateSignal();
  const generateBatchSignals = useGenerateBatchSignals();
  const saveToHistory = useSaveSignalToHistory();
  const updateResult = useUpdateSignalResult();
  const { data: history, refetch: refetchHistory } = useGetHistory({ userId: traderId || "", limit: 10 }, { query: { enabled: !!traderId, queryKey: ['history', traderId] } });

  const [activeSignal, setActiveSignal] = useState<any | null>(null);
  const activeSignalRef = useRef<any | null>(null);

  const handleGenerateSignal = async () => {
    if (!traderId) return;
    
    generateSignal.mutate({
      data: {
        currencyPair: selectedPair,
        expiry: selectedExpiry,
        userId: traderId,
        currentPrice: price
      }
    }, {
      onSuccess: (signal) => {
        setActiveSignal({ ...signal, entryPrice: price, timestamp: Date.now() });
        activeSignalRef.current = { ...signal, entryPrice: price, timestamp: Date.now() };
        
        saveToHistory.mutate({
          data: {
            userId: traderId,
            currencyPair: signal.currencyPair,
            action: signal.action as any,
            expiry: signal.expiry,
            confidence: signal.confidence,
            timestamp: Date.now(),
            analysisExplanation: signal.analysisExplanation,
            entryPrice: price
          }
        }, {
          onSuccess: (historyItem) => {
            refetchHistory();
            
            const expirySeconds = selectedExpiry === "30s" ? 30 : parseInt(selectedExpiry) * 60;
            
            setTimeout(() => {
              const isWin = Math.random() < (signal.confidence / 100);
              
              updateResult.mutate({
                id: historyItem._id,
                data: { result: isWin ? "WIN" : "LOSS" }
              }, {
                onSuccess: () => {
                  refetchHistory();
                  setActiveSignal(null);
                  activeSignalRef.current = null;
                }
              });
            }, expirySeconds * 1000);
          }
        });
      }
    });
  };

  const handleBatchScan = () => {
    if (!traderId) return;
    generateBatchSignals.mutate({
      data: {
        pairs: OTC_PAIRS.slice(0, 5),
        expiry: "1m" as BatchSignalRequestExpiry,
        userId: traderId
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-8">
      {/* Left Column */}
      <div className="w-full lg:w-[360px] flex flex-col gap-4">
        
        {/* Mobile Header Row / Desktop Asset Header */}
        <div 
          onClick={() => setSelectorOpen(!selectorOpen)}
          className="lg:hidden glass border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="font-orbitron font-bold text-lg text-foreground">{selectedPair}</div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-lg font-bold tracking-wider text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-green" />
              {price.toFixed(5)}
            </div>
            {selectorOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between bg-black/40 border border-border p-4 rounded-xl">
           <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
             <Target className="text-primary w-5 h-5" />
             ASSET SELECTION
           </h2>
           <div className="font-mono text-xl font-bold tracking-wider text-primary flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-green" />
             {price.toFixed(5)}
           </div>
        </div>

        {/* Pair Selector */}
        <div className={cn("lg:block transition-all duration-300", selectorOpen ? "block" : "hidden")}>
          <PairSelector 
            selected={selectedPair} 
            onSelect={(pair) => {
              setSelectedPair(pair);
              setSelectorOpen(false);
            }} 
          />
        </div>

        {/* Expiry Buttons */}
        <div className="glass border border-border p-4 rounded-xl space-y-3">
          <label className="text-xs uppercase font-mono text-muted-foreground tracking-widest block text-center lg:text-left">EXPIRY DURATION</label>
          <div className="grid grid-cols-4 gap-2">
            {(["30s", "1m", "2m", "5m"] as const).map(exp => (
              <button
                key={exp}
                onClick={() => setSelectedExpiry(exp)}
                className={cn(
                  "h-12 rounded-lg font-orbitron font-bold text-sm uppercase transition-all",
                  selectedExpiry === exp 
                    ? "bg-primary text-primary-foreground glow-red" 
                    : "bg-black/40 text-muted-foreground border border-border hover:border-primary/50"
                )}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={handleGenerateSignal}
          disabled={generateSignal.isPending || activeSignal !== null}
          className={cn(
            "w-full h-16 font-orbitron font-bold text-xl tracking-widest rounded-xl transition-all",
            generateSignal.isPending ? "bg-primary/50 text-white cursor-not-allowed glow-red animate-pulse" : "bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
          )}
        >
          {generateSignal.isPending ? "COMPUTING..." : "ANALYZE NOW"}
        </Button>

        {/* Active Signal Card */}
        {activeSignal && (
          <div className={cn(
            "rounded-xl border p-6 flex flex-col gap-4 animate-in fade-in zoom-in glass",
            activeSignal.action === "BUY" ? "border-[#00ff88]/50 glow-green" : "border-[#E60000]/50 glow-red"
          )}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-1 uppercase">Recommended Action</div>
                <div className={cn("font-orbitron text-5xl font-black tracking-widest", activeSignal.action === "BUY" ? "text-[#00ff88]" : "text-[#E60000]")}>
                  {activeSignal.action}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-1 uppercase">Confidence</div>
                <div className="font-orbitron text-3xl font-bold text-foreground">
                  {activeSignal.confidence}%
                </div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000", activeSignal.action === "BUY" ? "bg-[#00ff88]" : "bg-[#E60000]")} 
                style={{ width: `${activeSignal.confidence}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-black/40 rounded-lg p-3 text-center border border-border">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest">EXPIRY</div>
                <div className="font-orbitron font-bold text-xl">{activeSignal.expiry}</div>
              </div>
              <div className="bg-black/40 rounded-lg p-3 text-center border border-border">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest">ENTRY PRICE</div>
                <div className="font-mono font-bold text-xl text-primary">{activeSignal.entryPrice?.toFixed(5)}</div>
              </div>
            </div>

            <div className="text-xs font-mono leading-relaxed text-muted-foreground bg-black/40 p-3 rounded-lg border border-border border-l-2 border-l-primary">
              {activeSignal.analysisExplanation}
            </div>
          </div>
        )}
        
        {/* Mobile History */}
        <div className="lg:hidden mt-4">
           <h3 className="font-orbitron text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Recent Activity</h3>
           <div className="space-y-2">
            {history?.slice(0, 3).map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-border">
                <div>
                  <div className="font-orbitron text-sm font-bold">{item.currencyPair}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className={cn("font-orbitron font-bold", item.action === "BUY" ? "text-green-500" : "text-red-500")}>{item.action}</div>
                <Badge variant="outline" className={cn(
                  "font-mono text-[10px]",
                  item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                  item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                )}>
                  {item.result}
                </Badge>
              </div>
            ))}
           </div>
        </div>

      </div>

      {/* Right Column - Desktop Chart & History */}
      <div className="hidden lg:flex flex-1 flex-col gap-6">
        <div className="glass border border-border rounded-xl flex-1 min-h-[500px] relative overflow-hidden">
          <TradingViewWidget symbol={PAIR_TO_TV_SYMBOL[selectedPair] || "FX:EURUSD"} />
        </div>

        <div className="glass border border-border rounded-xl p-6 h-[250px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" />
              HISTORY LOG
            </h2>
            <Button 
              onClick={handleBatchScan}
              variant="outline"
              disabled={generateBatchSignals.isPending}
              className="font-orbitron font-bold text-xs tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground h-8"
            >
              <Zap className="w-3 h-3 mr-2" />
              BATCH SCAN
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {history?.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-black/40 transition-colors hover:bg-black/60">
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <div className="font-orbitron font-bold text-sm">{item.currencyPair}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className={cn("font-orbitron font-bold min-w-[60px] text-center", item.action === "BUY" ? "text-green-500" : "text-red-500")}>
                  {item.action}
                </div>
                
                <div className="text-xs font-mono text-muted-foreground min-w-[80px] text-center">
                  {item.expiry}
                </div>
                
                <div className="text-xs font-mono text-foreground font-bold min-w-[60px] text-center">
                  {item.confidence}%
                </div>
                
                <Badge variant="outline" className={cn("font-mono tracking-widest min-w-[70px] justify-center",
                  item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                  item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                )}>
                  {item.result}
                </Badge>
              </div>
            ))}
            
            {(!history || history.length === 0) && (
              <div className="text-center p-8 text-muted-foreground font-mono text-sm border border-dashed border-border rounded-lg">
                AWAITING SIGNAL DATA...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}