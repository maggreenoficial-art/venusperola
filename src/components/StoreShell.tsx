"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/gerenciaralojabt");
  const hideBottomBar =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/pedido/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="page-main flex-1">{children}</main>
      <Footer />
      {!hideBottomBar && <MobileBottomBar />}
    </>
  );
}
