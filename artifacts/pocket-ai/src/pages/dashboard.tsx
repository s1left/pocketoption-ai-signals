import React, { useState, useEffect, useRef } from "react";
import { TradingViewWidget } from "../components/tradingview-widget";
import { ALL_PAIRS, PAIR_TO_TV_SYMBOL, SignalRequestExpiry, BatchSignalRequestExpiry } from "../lib/constants";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Clock, Zap, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { traderId } = useAuth();
  const [selectedPair, setSelectedPair] = useState("EUR/USD (OTC)");
  const [selectedExpiry, setSelectedExpiry] = useState<SignalRequestExpiry>("1m");
  
  const price = usePriceTicker(1.0850);
  const generateSignal = useGenerateSignal();
  const generateBatchSignals = useGenerateBatchSignals();
  const saveToHistory = useSaveSignalToHistory();
  const updateResult = useUpdateSignalResult();
  const { data: history, refetch: refetchHistory } = useGetHistory({ userId: traderId || "", limit: 10 }, { query: { enabled: !!traderId } });

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
        
        // Save to history immediately as pending
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
            
            // Setup timeout to auto-resolve based on expiry and simulated price movement
            const expirySeconds = selectedExpiry === "30s" ? 30 : parseInt(selectedExpiry) * 60;
            
            setTimeout(() => {
              // Get current simulated price to determine win/loss
              // If it's a mock, we'll just determine it randomly or based on confidence
              const currentSimPrice = price; // This would use the live price at that exact future moment
              const entryPrice = activeSignalRef.current?.entryPrice || price;
              const isCall = signal.action === "BUY";
              
              // Simplistic logic for mock: if BUY and price > entryPrice -> WIN
              // We'll just randomly decide for the mock to make it interesting, weighted by confidence
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
        pairs: ALL_PAIRS.filter(p => p.includes("OTC")).slice(0, 5), // Just 5 for mock
        expiry: "1m" as BatchSignalRequestExpiry,
        userId: traderId
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column - Controls & Signal */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Controls Card */}
        <div className="bg-card border border-border p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="text-primary w-5 h-5" />
              SIGNAL PARAMS
            </h2>
            <div className="font-mono text-xl font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              {price.toFixed(5)}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase font-mono text-muted-foreground tracking-widest">ASSET</label>
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="font-orbitron font-bold h-12 bg-background/50 border-border text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-orbitron">
                {ALL_PAIRS.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase font-mono text-muted-foreground tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" /> EXPIRY TIME
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["30s", "1m", "2m", "5m"] as const).map(exp => (
                <button
                  key={exp}
                  onClick={() => setSelectedExpiry(exp)}
                  className={`h-10 font-orbitron font-bold text-sm uppercase transition-colors border ${
                    selectedExpiry === exp 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerateSignal}
            disabled={generateSignal.isPending || activeSignal !== null}
            className="h-14 font-orbitron font-bold text-xl tracking-widest bg-primary hover:bg-primary/80 text-primary-foreground relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            {generateSignal.isPending ? "COMPUTING..." : "ANALYZE NOW"}
          </Button>

          <Button 
            onClick={handleBatchScan}
            variant="outline"
            disabled={generateBatchSignals.isPending}
            className="h-10 font-orbitron font-bold text-sm tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Zap className="w-4 h-4 mr-2" />
            SCAN ALL OTC (BATCH)
          </Button>
        </div>

        {/* Active Signal Display */}
        {activeSignal && (
          <div className={`border-2 p-6 flex flex-col gap-4 animate-in fade-in zoom-in ${
            activeSignal.action === "BUY" ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-mono text-muted-foreground tracking-widest mb-1">RECOMMENDED ACTION</div>
                <div className={`font-orbitron text-4xl font-bold tracking-widest ${
                  activeSignal.action === "BUY" ? "text-green-500" : "text-red-500"
                }`}>
                  {activeSignal.action}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground tracking-widest mb-1">CONFIDENCE</div>
                <div className="font-orbitron text-2xl font-bold text-foreground">
                  {activeSignal.confidence}%
                </div>
              </div>
            </div>

            <div className="w-full h-2 bg-background border border-border overflow-hidden">
              <div 
                className={`h-full ${activeSignal.action === "BUY" ? "bg-green-500" : "bg-red-500"}`} 
                style={{ width: `${activeSignal.confidence}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-background/50 border border-border p-3">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest">EXPIRY</div>
                <div className="font-orbitron font-bold text-lg">{activeSignal.expiry}</div>
              </div>
              <div className="bg-background/50 border border-border p-3">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest">ENTRY PRICE</div>
                <div className="font-mono font-bold text-lg">{activeSignal.entryPrice?.toFixed(5)}</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-background/50 border border-border p-3 mt-2 border-l-2 border-l-primary">
              {activeSignal.analysisExplanation}
            </div>
          </div>
        )}

      </div>

      {/* Right Column - Chart & Mini History */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        
        {/* Chart */}
        <div className="bg-card border border-border flex-1 min-h-[400px] relative">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
            <h2 className="font-orbitron text-lg font-bold text-white drop-shadow-md">
              {selectedPair}
            </h2>
          </div>
          <TradingViewWidget symbol={PAIR_TO_TV_SYMBOL[selectedPair] || "FX:EURUSD"} />
        </div>

        {/* Recent Signals */}
        <div className="bg-card border border-border p-6 max-h-[300px] overflow-auto">
          <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary w-5 h-5" />
            RECENT ACTIVITY
          </h2>
          
          <div className="space-y-2">
            {history?.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 border border-border bg-background/50">
                <div className="flex flex-col gap-1">
                  <div className="font-orbitron font-bold">{item.currencyPair}</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
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
                
                <Badge variant="outline" className={`font-mono tracking-widest ${
                  item.result === "WIN" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  item.result === "LOSS" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }`}>
                  {item.result}
                </Badge>
              </div>
            ))}
            
            {(!history || history.length === 0) && (
              <div className="text-center p-8 text-muted-foreground font-mono text-sm border border-dashed border-border">
                NO RECENT SIGNALS DETECTED
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
