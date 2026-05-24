import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Activity } from "lucide-react";

export default function Login() {
  const [telegramId, setTelegramId] = useState("");
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (telegramId.trim()) {
      login(telegramId.trim());
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden dark">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Activity className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-foreground text-center tracking-wider">
            POCKET AI <span className="text-primary">PRO</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm uppercase tracking-widest font-mono text-center">
            Restricted Terminal Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
              TELEGRAM ID AUTHENTICATION
            </label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="Enter Telegram ID"
                className="pl-10 bg-background/50 border-border font-mono text-lg h-12 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-orbitron font-bold tracking-widest text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
          >
            INITIALIZE UPLINK
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex justify-between text-xs font-mono text-muted-foreground">
          <span>v2.1.4_STABLE</span>
          <span>SECURE CONNECTION</span>
        </div>
      </div>
    </div>
  );
}
