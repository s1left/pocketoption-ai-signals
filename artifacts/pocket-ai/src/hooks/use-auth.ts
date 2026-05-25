import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ADMIN_ID } from "../lib/constants";

export function useAuth() {
  const [traderId, setTraderId] = useState<string | null>(() => {
    return localStorage.getItem("trader_id");
  });
  const [verified, setVerified] = useState(false);
  const [, setLocation] = useLocation();
  const [initialSearch] = useState(() => window.location.search);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  const login = useCallback((id: string) => {
    localStorage.setItem("trader_id", id);
    setTraderId(id);

    fetch(`${apiBaseUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: id, username: id }),
    }).catch(() => {});

    setLocation("/");
  }, [apiBaseUrl, setLocation]);

  useEffect(() => {
    const id = localStorage.getItem("trader_id");
    if (!id) {
      const queryId = new URLSearchParams(initialSearch).get("id");
      if (queryId) {
        login(queryId);
        return;
      }

      setVerified(true);
      if (window.location.pathname !== "/login") {
        setLocation("/login");
      }
      return;
    }

    fetch(`${apiBaseUrl}/users/${id}`)
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
  }, [initialSearch, login, setLocation]);

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
