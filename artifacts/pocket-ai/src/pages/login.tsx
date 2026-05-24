import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { SiTelegram } from "react-icons/si";

export default function Login() {
  const [telegramId, setTelegramId] = useState("");
  const [showManual, setShowManual] = useState(false);
  const { login } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const id = params.get("id");
    if (id) {
      login(id);
    }
  }, [search, login]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (telegramId.trim()) {
      login(telegramId.trim());
    }
  };

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "pocketai_bot";
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden grid-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass border border-border p-8 relative z-10 rounded-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 rounded-lg glow-red">
            <Activity className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-orbitron font-bold text-foreground text-center tracking-wider">
            POCKET AI <span className="text-primary">PRO</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm uppercase tracking-widest font-mono text-center">
            Secure Terminal Authentication
          </p>
        </div>

        <div className="space-y-6">
          <Button
            asChild
            className="w-full h-16 text-lg font-bold bg-[#0088cc] hover:bg-[#0088cc]/90 text-white rounded-lg flex items-center justify-center gap-3 transition-all"
          >
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <SiTelegram className="w-6 h-6" />
              LOGIN WITH TELEGRAM
            </a>
          </Button>

          <div className="space-y-4 text-sm font-mono text-muted-foreground bg-black/40 p-4 rounded-lg border border-border">
            <h3 className="font-bold text-foreground mb-2">AUTH SEQUENCE:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open Pocket AI Bot</li>
              <li>Type /start to activate</li>
              <li>Click returned secure link</li>
            </ol>
          </div>

          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="flex items-center justify-between w-full text-xs uppercase font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>MANUAL ID ENTRY</span>
              {showManual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showManual && (
              <form onSubmit={handleLogin} className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="Enter Telegram ID"
                    className="pl-10 bg-background/50 border-border font-mono h-12 focus-visible:ring-primary"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 font-orbitron font-bold tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
                >
                  CONNECT
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>v3.0.0_PRO</span>
          <span className="text-green-500">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}