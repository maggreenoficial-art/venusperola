"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  AdminMobileNav,
  adminPageTitle,
} from "@/components/admin/AdminMobileNav";

const nav = [
  { href: "/gerenciaralojabt", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gerenciaralojabt/meta", label: "Meta Ads", icon: Megaphone },
  { href: "/gerenciaralojabt/trafego", label: "Traffic Shield", icon: Shield },
  { href: "/gerenciaralojabt/afiliados", label: "Afiliados", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/gerenciaralojabt/login";

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/gerenciaralojabt/login");
    router.refresh();
  };

  if (isLogin) {
    return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 p-6 lg:flex">
        <Link href="/gerenciaralojabt" className="font-serif text-xl italic">
          Vênus Pérola
        </Link>
        <p className="mt-1 text-[10px] tracking-widest text-muted uppercase">
          Painel Admin
        </p>

        <nav className="mt-10 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/gerenciaralojabt" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            href="/loja"
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-white"
          >
            <ShoppingBag size={14} />
            Ver loja
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted hover:text-red-400"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="admin-mobile-header sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/95 px-4 py-3 backdrop-blur-md lg:hidden"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
        >
          <div className="min-w-0">
            <p className="truncate font-serif text-lg italic leading-tight">
              {adminPageTitle(pathname)}
            </p>
            <p className="text-[10px] tracking-widest text-muted uppercase">
              Vênus Pérola
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/loja"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-white"
              aria-label="Ver loja"
            >
              <ShoppingBag size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-red-400"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-main flex-1 overflow-x-hidden">{children}</main>
        <AdminMobileNav />
      </div>
    </div>
  );
}
