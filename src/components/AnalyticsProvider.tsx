"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/tracking";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/gerenciaralojabt")) return;
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
