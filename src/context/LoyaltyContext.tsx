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
import { useAuth } from "@/context/AuthContext";
import {
  calculateDiscountFromPearls,
  calculatePearlsEarned,
  loyalty,
} from "@/lib/loyalty";

interface LoyaltyState {
  pearls: number;
  email: string | null;
  isMember: boolean;
  redeemedPearls: number;
}

interface LoyaltyContextValue extends LoyaltyState {
  joinClub: () => Promise<boolean>;
  addPearlsFromPurchase: (totalPrice: number) => number;
  redeemPearls: (amount: number) => number;
  clearRedemption: () => void;
  discount: number;
}

const STORAGE_KEY = "venus-perola-loyalty";
const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

function loadGuestState(): Pick<LoyaltyState, "redeemedPearls"> {
  if (typeof window === "undefined") return { redeemedPearls: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { redeemedPearls: 0 };
    return JSON.parse(raw) as Pick<LoyaltyState, "redeemedPearls">;
  } catch {
    return { redeemedPearls: 0 };
  }
}

function saveGuestRedemption(redeemedPearls: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ redeemedPearls }));
}

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const [redeemedPearls, setRedeemedPearls] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const guest = loadGuestState();
    setRedeemedPearls(guest.redeemedPearls);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      saveGuestRedemption(redeemedPearls);
    }
  }, [redeemedPearls, hydrated, user]);

  const pearls = user && profile ? profile.pearls : 0;
  const isMember = user && profile ? profile.is_club_member : false;
  const email = profile?.email ?? user?.email ?? null;

  const joinClub = useCallback(async () => {
    if (!user) return false;
    try {
      const res = await fetch("/api/clube-venus", { method: "POST" });
      if (!res.ok) return false;
      await refreshProfile();
      return true;
    } catch {
      return false;
    }
  }, [user, refreshProfile]);

  const addPearlsFromPurchase = useCallback(
    (totalPrice: number) => {
      const earned = calculatePearlsEarned(totalPrice);
      if (user) refreshProfile();
      return earned;
    },
    [user, refreshProfile]
  );

  const redeemPearls = useCallback(
    (amount: number) => {
      if (!isMember || pearls === 0) return 0;
      const redeemable =
        Math.floor(pearls / loyalty.redeemRate) * loyalty.redeemRate;
      const toRedeem = Math.min(amount, redeemable);
      if (toRedeem < loyalty.minRedeem) return 0;
      const discount = calculateDiscountFromPearls(toRedeem);
      setRedeemedPearls(toRedeem);
      return discount;
    },
    [isMember, pearls]
  );

  const clearRedemption = useCallback(() => {
    setRedeemedPearls(0);
  }, []);

  const discount = useMemo(
    () => calculateDiscountFromPearls(redeemedPearls),
    [redeemedPearls]
  );

  const value = useMemo(
    () => ({
      pearls,
      email,
      isMember,
      redeemedPearls,
      joinClub,
      addPearlsFromPurchase,
      redeemPearls,
      clearRedemption,
      discount,
    }),
    [
      pearls,
      email,
      isMember,
      redeemedPearls,
      joinClub,
      addPearlsFromPurchase,
      redeemPearls,
      clearRedemption,
      discount,
    ]
  );

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty must be used within LoyaltyProvider");
  return ctx;
}
