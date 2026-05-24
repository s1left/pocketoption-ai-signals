import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ADMIN_ID } from "../lib/constants";
import { useCreateOrUpdateUser } from "@workspace/api-client-react";

export function useAuth() {
  const [traderId, setTraderId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const createOrUpdateUser = useCreateOrUpdateUser();

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
    createOrUpdateUser.mutate({ data: { telegramId: id, username: id } });
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