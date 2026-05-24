import React, { useEffect } from "react";
import { useSearch } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Activity } from "lucide-react";
import { SiTelegram } from "react-icons/si";

export default function Login() {
  const { login } = useAuth();
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const id = params.get("id");
    if (id) login(id);
  }, [search]);

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "Pocketoption_ai_signal_bot";

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden grid-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm glass border border-border p-7 relative z-10 rounded-2xl">
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 rounded-xl glow-red">
            <Activity className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-foreground text-center tracking-wider">
            POCKET AI <span className="text-primary">PRO</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest font-mono text-center">
            Secure Signal Terminal
          </p>
        </div>

        <div className="space-y-5">
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 bg-[#0088cc] hover:bg-[#0077bb] text-white rounded-xl flex items-center justify-center gap-3 font-orbitron font-bold tracking-widest transition-all active:scale-95"
          >
            <SiTelegram className="w-5 h-5" />
            ВОЙТИ ЧЕРЕЗ TELEGRAM
          </a>

          <div className="bg-black/30 p-4 rounded-xl border border-border text-sm font-mono text-muted-foreground space-y-2">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">Как получить доступ:</p>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold shrink-0">1.</span>
              <span>Нажмите кнопку выше и откройте бота</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold shrink-0">2.</span>
              <span>Отправьте <code className="bg-primary/10 text-primary px-1 rounded">/start</code> — запрос уйдёт администратору</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-bold shrink-0">3.</span>
              <span>После одобрения нажмите ссылку от бота — войдёте автоматически</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>v3.0.0 PRO</span>
          <span className="text-green-500">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}
