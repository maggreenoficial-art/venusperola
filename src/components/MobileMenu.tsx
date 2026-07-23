"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/loja", label: "Loja" },
  { href: "/colecoes/perola-secreta", label: "Pérola Secreta" },
  { href: "/mystery-box", label: "Mystery Box" },
  { href: "/bem-estar", label: "Bem-Estar" },
  { href: "/guias", label: "Guias" },
  { href: "/clube-venus", label: "Clube Vênus" },
  { href: "/contato", label: "Contato" },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <nav
        className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-black border-l border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-sm tracking-[0.15em] text-muted uppercase">Menu</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-14 items-center rounded-lg px-4 text-base transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="border-t border-white/10 px-5 py-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/conta"
            onClick={onClose}
            className="flex min-h-14 items-center justify-center rounded-full border border-white/20 text-base hover:border-accent"
          >
            Minha conta
          </Link>
        </div>
      </nav>
    </div>
  );
}
