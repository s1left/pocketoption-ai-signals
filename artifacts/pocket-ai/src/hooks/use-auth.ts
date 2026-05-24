import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ADMIN_ID } from "../lib/constants";

export function useAuth() {
  const [traderId, setTraderId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = localStorage.getItem("trader_id");
    if (id) {
      setTraderId(id);
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const login = (id: string) => {
    localStorage.setItem("trader_id", id);
    setTraderId(id);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("trader_id");
    setTraderId(null);
    setLocation("/login");
  };

  return {
    traderId,
    isAdmin: traderId === ADMIN_ID,
    login,
    logout,
    isAuthenticated: !!traderId,
  };
}
