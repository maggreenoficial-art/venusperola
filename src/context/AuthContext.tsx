"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin";
  pearls: number;
  is_club_member: boolean;
  club_joined_at: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const refreshProfile = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
    setProfile(data.profile ?? null);
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshProfile();
    });

    return () => subscription.unsubscribe();
  }, [supabase, refreshProfile]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Erro ao criar conta.";
      await refreshProfile();
      return null;
    },
    [refreshProfile]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Erro ao entrar.";
      await refreshProfile();
      return null;
    },
    [refreshProfile]
  );

  const signOut = useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      isAdmin: profile?.role === "admin",
    }),
    [user, profile, loading, signUp, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
