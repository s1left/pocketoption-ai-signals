import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ADMIN_ID } from "../lib/constants";

export function useAuth() {
  const [traderId, setTraderId] = useState<string | null>(() => {
    return localStorage.getItem("trader_id");
  });
  const [verified, setVerified] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = localStorage.getItem("trader_id");
    if (!id) {
      setVerified(true);
      setLocation("/login");
      return;
    }

    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((user) => {
        if (user && (user.hasAccess || user.telegramId === ADMIN_ID)) {
          setTraderId(id);
        } else {
          localStorage.removeItem("trader_id");
          setTraderId(null);
          setLocation("/login");
        }
      })
      .catch(() => {
        setTraderId(id);
      })
      .finally(() => setVerified(true));
  }, [setLocation]);

  const login = useCallback((id: string) => {
    localStorage.setItem("trader_id", id);
    setTraderId(id);

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: id, username: id }),
    }).catch(() => {});

    setLocation("/");
  }, [setLocation]);

  const logout = useCallback(() => {
    localStorage.removeItem("trader_id");
    setTraderId(null);
    setLocation("/login");
  }, [setLocation]);

  return {
    traderId,
    isAdmin: traderId === ADMIN_ID,
    login,
    logout,
    isAuthenticated: !!traderId,
    verified,
  };
}
