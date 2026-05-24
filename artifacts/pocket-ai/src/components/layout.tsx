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

  if (!isAuthenticated) return <>{children}</>;

  const navItems = [
    { label: "Terminal", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Analysis", href: "/analysis", icon: <Activity size={18} /> },
    { label: "History", href: "/history", icon: <History size={18} /> },
  ];
  if (isAdmin) navItems.push({ label: "Admin", href: "/admin", icon: <ShieldAlert size={18} /> });

  return (
    <div className="flex min-h-[100dvh] w-full bg-background grid-bg overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex group w-14 hover:w-52 transition-all duration-300 border-r border-border glass flex-col justify-between shrink-0 z-20 absolute h-full top-0 left-0">
        <div>
          <div className="h-12 flex items-center justify-center group-hover:justify-start group-hover:px-5 border-b border-border overflow-hidden whitespace-nowrap">
            <Activity className="w-6 h-6 text-primary shrink-0" />
            <span className="font-orbitron font-bold text-base text-primary ml-3 opacity-0 group-hover:opacity-100 transition-opacity">POCKET AI</span>
          </div>
          <nav className="flex flex-col p-2 gap-1 mt-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors overflow-hidden whitespace-nowrap ${
                  location === item.href
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}>
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-2 mb-3">
          <button onClick={logout} className="w-full flex items-center justify-center group-hover:justify-start gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors overflow-hidden whitespace-nowrap">
            <LogOut size={18} className="shrink-0" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Выйти</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-12 border-b border-border glass z-30 flex items-center justify-between px-4">
        <Activity className="w-5 h-5 text-primary" />
        <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {time}
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-primary transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full h-[100dvh] overflow-y-auto md:pl-14 pt-12 md:pt-0 pb-16 md:pb-0 relative">
        <div className="hidden md:flex h-11 border-b border-border glass sticky top-0 z-10 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-orbitron tracking-widest text-primary">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-muted-foreground">UTC:</span>
            <span className="text-primary font-bold">{time}</span>
          </div>
        </div>
        <div className="p-3 md:p-5 w-full h-full">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border glass z-30 flex items-center justify-around px-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className={`flex flex-col items-center justify-center gap-0.5 h-full w-full ${location === item.href ? "text-primary" : "text-muted-foreground"}`}>
              {item.icon}
              <span className="text-[9px] font-mono tracking-wider">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
