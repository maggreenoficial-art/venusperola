"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, X, User, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/colecoes/perola-secreta", label: "Pérola Secreta" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/loja", label: "Loja" },
  { href: "/bem-estar", label: "Bem-Estar" },
  { href: "/guias", label: "Guias" },
  { href: "/clube-venus", label: "Clube Vênus" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/loja?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-white md:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
              <Logo size="sm" />
            </div>

            <nav className="hidden items-center gap-5 lg:flex">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm tracking-wide transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-white hover:text-accent-hover"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center text-white/60 transition-colors hover:text-white"
                aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              <Link
                href="/conta"
                className="hidden h-10 w-10 items-center justify-center text-white/60 transition-colors hover:text-white sm:flex"
                aria-label="Minha conta"
              >
                <User size={18} />
              </Link>

              <button
                onClick={openCart}
                className="relative hidden h-10 w-10 items-center justify-center text-white transition-colors hover:text-accent md:flex"
                aria-label="Abrir carrinho"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-black">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="mt-3 flex gap-2 border-t border-white/10 pt-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..."
                autoFocus
                className="min-h-11 flex-1 rounded-full border border-white/30 bg-transparent px-4 text-base text-white outline-none focus:border-accent sm:text-sm"
              />
              <button
                type="submit"
                className="touch-target shrink-0 rounded-full bg-white px-5 text-xs font-semibold text-black"
              >
                Buscar
              </button>
            </form>
          )}
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
