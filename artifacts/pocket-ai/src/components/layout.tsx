import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, History, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const [time, setTime] = useState(new Date().toISOString().substring(11, 19));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Terminal", href: "/", icon: <LayoutDashboard size={20} /> },
    { label: "Analysis", href: "/analysis", icon: <Activity size={20} /> },
    { label: "History", href: "/history", icon: <History size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin", href: "/admin", icon: <ShieldAlert size={20} /> });
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-background grid-bg dark overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex group w-16 hover:w-60 transition-all duration-300 border-r border-border glass flex-col justify-between shrink-0 z-20 absolute h-full top-0 left-0">
        <div>
          <div className="h-16 flex items-center justify-center group-hover:justify-start group-hover:px-6 border-b border-border overflow-hidden whitespace-nowrap">
            <Activity className="w-8 h-8 text-primary shrink-0" />
            <span className="font-orbitron font-bold text-xl text-primary ml-3 opacity-0 group-hover:opacity-100 transition-opacity">POCKET AI PRO</span>
          </div>
          <nav className="flex flex-col p-2 gap-2 mt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors overflow-hidden whitespace-nowrap ${
                    location === item.href
                      ? "bg-primary/20 text-primary border border-primary/30 glow-red"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-2 mb-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-3 py-3 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors overflow-hidden whitespace-nowrap"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border glass z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-primary font-bold">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {time}
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-primary transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full h-[100dvh] overflow-y-auto md:pl-16 pt-16 md:pt-0 pb-20 md:pb-0 relative">
        <div className="hidden md:flex h-16 border-b border-border glass sticky top-0 z-10 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse glow-red" />
            <span className="text-sm font-orbitron tracking-widest text-primary">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-muted-foreground">UTC:</span>
            <span className="text-primary font-bold">{time}</span>
          </div>
        </div>
        
        <div className="p-4 md:p-6 w-full h-full">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 border-t border-border glass z-30 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <div
              className={`flex flex-col items-center justify-center gap-1 h-full w-full ${
                location === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-mono tracking-wider">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

    </div>
  );
}