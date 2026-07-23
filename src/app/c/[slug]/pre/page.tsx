"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CampaignPrePage() {
  const searchParams = useSearchParams();
  const dest = searchParams.get("vp_dest") ?? "safe";
  const target = searchParams.get("vp_to") ?? (dest === "offer" ? "/loja" : "/bem-estar");

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = target;
    }, 1800);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
      <p className="mt-6 text-sm text-muted">Carregando conteúdo...</p>
      <p className="mt-2 text-[10px] text-muted/60">
        Você será redirecionado em instantes
      </p>
    </div>
  );
}
