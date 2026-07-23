"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCart } from "@/context/CartContext";
import { formatCep } from "@/lib/checkout";
import type { ShippingQuote, ShippingServiceId } from "@/lib/correios";

const SHIPPING_CEP_KEY = "venus-perola-shipping-cep";
const SHIPPING_SERVICE_KEY = "venus-perola-shipping-service";

interface ShippingContextValue {
  destinationCep: string;
  setDestinationCep: (cep: string) => void;
  quotes: ShippingQuote[];
  selectedService: ShippingServiceId | null;
  shippingCost: number;
  shippingDays: number;
  freeShippingApplied: boolean;
  loading: boolean;
  isEstimate: boolean;
  error: string | null;
  isReady: boolean;
  selectService: (service: ShippingServiceId) => void;
  refreshShipping: () => Promise<void>;
}

const ShippingContext = createContext<ShippingContextValue | null>(null);

function applySelectedQuote(
  quotes: ShippingQuote[],
  service: ShippingServiceId | null,
  freeShippingApplied: boolean
) {
  const selected =
    quotes.find((q) => q.service === service && !q.error) ??
    quotes.find((q) => !q.error) ??
    null;

  return {
    selectedService: selected?.service ?? null,
    shippingCost: selected
      ? freeShippingApplied
        ? 0
        : selected.price
      : 0,
    shippingDays: selected?.deliveryDays ?? 0,
  };
}

export function ShippingProvider({ children }: { children: ReactNode }) {
  const { items, totalPrice } = useCart();

  const [destinationCep, setDestinationCepState] = useState("");
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedService, setSelectedService] = useState<ShippingServiceId | null>(
    null
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingDays, setShippingDays] = useState(0);
  const [freeShippingApplied, setFreeShippingApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEstimate, setIsEstimate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const selectedServiceRef = useRef<ShippingServiceId | null>(null);
  const fetchIdRef = useRef(0);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  useEffect(() => {
    selectedServiceRef.current = selectedService;
  }, [selectedService]);

  useEffect(() => {
    const storedCep = localStorage.getItem(SHIPPING_CEP_KEY) ?? "";
    const storedService = localStorage.getItem(
      SHIPPING_SERVICE_KEY
    ) as ShippingServiceId | null;
    if (storedCep) setDestinationCepState(storedCep);
    if (storedService) {
      setSelectedService(storedService);
      selectedServiceRef.current = storedService;
    }
    setHydrated(true);
  }, []);

  const setDestinationCep = useCallback((value: string) => {
    const formatted = formatCep(value);
    setDestinationCepState(formatted);
    localStorage.setItem(SHIPPING_CEP_KEY, formatted);
    setError(null);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) {
      setQuotes([]);
      setSelectedService(null);
      selectedServiceRef.current = null;
      setShippingCost(0);
      setShippingDays(0);
      setFreeShippingApplied(false);
      setIsEstimate(false);
      localStorage.removeItem(SHIPPING_SERVICE_KEY);
    }
  }, []);

  const fetchShipping = useCallback(async () => {
    const digits = destinationCep.replace(/\D/g, "");
    if (digits.length !== 8 || itemCount === 0) return;

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationCep: digits,
          itemCount,
          subtotal: totalPrice,
          selectedService: selectedServiceRef.current ?? undefined,
        }),
      });

      const data = await res.json();
      if (fetchId !== fetchIdRef.current) return;

      if (!res.ok) {
        setError(data.error ?? "Não foi possível calcular o frete.");
        return;
      }

      const nextQuotes = (data.quotes ?? []) as ShippingQuote[];
      const free = Boolean(data.freeShippingApplied);
      const preferred = selectedServiceRef.current;
      const applied = applySelectedQuote(nextQuotes, preferred, free);

      setQuotes(nextQuotes);
      setSelectedService(applied.selectedService);
      setShippingCost(applied.shippingCost);
      setShippingDays(applied.shippingDays);
      setFreeShippingApplied(free);
      setIsEstimate(Boolean(data.isEstimate));

      if (applied.selectedService) {
        localStorage.setItem(SHIPPING_SERVICE_KEY, applied.selectedService);
      }

      if (data.isEstimate) {
        setError("Cotação estimada — configure as credenciais dos Correios.");
      }
    } catch {
      if (fetchId !== fetchIdRef.current) return;
      setError("Erro de conexão ao calcular frete.");
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [destinationCep, itemCount, totalPrice]);

  const selectService = useCallback(
    (service: ShippingServiceId) => {
      selectedServiceRef.current = service;
      setSelectedService(service);
      localStorage.setItem(SHIPPING_SERVICE_KEY, service);

      const quote = quotes.find((q) => q.service === service && !q.error);
      if (quote) {
        setShippingCost(freeShippingApplied ? 0 : quote.price);
        setShippingDays(quote.deliveryDays);
      }
    },
    [quotes, freeShippingApplied]
  );

  const refreshShipping = useCallback(async () => {
    await fetchShipping();
  }, [fetchShipping]);

  useEffect(() => {
    if (!hydrated || itemCount === 0) return;
    const digits = destinationCep.replace(/\D/g, "");
    if (digits.length === 8) {
      void fetchShipping();
    }
  }, [hydrated, destinationCep, itemCount, totalPrice, fetchShipping]);

  useEffect(() => {
    if (itemCount === 0) {
      setQuotes([]);
      setSelectedService(null);
      selectedServiceRef.current = null;
      setShippingCost(0);
      setShippingDays(0);
      setFreeShippingApplied(false);
      setIsEstimate(false);
      setError(null);
    }
  }, [itemCount]);

  const isReady =
    destinationCep.replace(/\D/g, "").length === 8 &&
    selectedService !== null &&
    quotes.some((q) => q.service === selectedService && !q.error) &&
    !loading;

  const value = useMemo(
    () => ({
      destinationCep,
      setDestinationCep,
      quotes,
      selectedService,
      shippingCost,
      shippingDays,
      freeShippingApplied,
      loading,
      isEstimate,
      error,
      isReady,
      selectService,
      refreshShipping,
    }),
    [
      destinationCep,
      setDestinationCep,
      quotes,
      selectedService,
      shippingCost,
      shippingDays,
      freeShippingApplied,
      loading,
      isEstimate,
      error,
      isReady,
      selectService,
      refreshShipping,
    ]
  );

  return (
    <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>
  );
}

export function useShipping() {
  const ctx = useContext(ShippingContext);
  if (!ctx) throw new Error("useShipping must be used within ShippingProvider");
  return ctx;
}
