import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, History, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isAdmin, logout, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      // Handled by useAuth internally, but good to have here just in case
    }
  }, [isAuthenticated, location]);

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
    <div className="flex h-screen bg-background dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-border bg-card flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border">
            <span className="font-orbitron font-bold text-xl text-primary hidden md:block">POCKET AI</span>
            <span className="font-orbitron font-bold text-xl text-primary md:hidden">PA</span>
          </div>
          <nav className="flex flex-col p-2 gap-2 mt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors ${
                    location === item.href
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:block font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-2 mb-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden md:block font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background relative flex flex-col">
        {/* Topbar/HUD Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
            <span className="text-sm font-orbitron tracking-widest text-muted-foreground">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-muted-foreground">UTC:</span>
            <span className="text-foreground">{new Date().toISOString().substring(11, 19)}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
