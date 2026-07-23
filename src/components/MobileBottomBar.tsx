"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/loja", label: "Loja", icon: Store, exact: false },
  { href: "/conta", label: "Conta", icon: User, exact: false },
] as const;

export function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] tracking-wide transition-colors",
                isActive ? "text-accent" : "text-white/50"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              <span>{label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openCart}
          className="relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] tracking-wide text-white/50 transition-colors hover:text-accent"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag size={20} />
          <span>Carrinho</span>
          {totalItems > 0 && (
            <span className="absolute right-[calc(50%-1.25rem)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-black">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
