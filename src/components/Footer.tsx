import Link from "next/link";
import { Logo } from "./Logo";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <Logo size="sm" />

        <nav className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-muted sm:flex sm:flex-wrap sm:justify-center sm:gap-6">
          <Link href="/bem-estar" className="hover:text-white">
            Bem-Estar
          </Link>
          <Link href="/guias" className="hover:text-white">
            Guias
          </Link>
          <Link href="/clube-venus" className="hover:text-white">
            Clube Vênus
          </Link>
          <Link href="/mystery-box" className="hover:text-white">
            Mystery Box
          </Link>
          <Link href="/colecoes/perola-secreta" className="hover:text-white">
            Pérola Secreta
          </Link>
          <Link href="/loja" className="hover:text-white">
            Loja
          </Link>
          <Link href="/categorias" className="hover:text-white">
            Categorias
          </Link>
          <Link href="/contato" className="hover:text-white">
            Contato
          </Link>
          <Link href="/politica-privacidade" className="hover:text-white">
            Privacidade
          </Link>
        </nav>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>

      <p className="mx-auto mt-8 max-w-lg text-center text-[10px] leading-relaxed text-white/30">
        {brand.storeLegal} · Venda proibida para menores de 18 anos. Embalagem
        discreta em todas as entregas. Entrega discreta garantida — sem menção à
        loja na fatura ou na caixa.
      </p>
    </footer>
  );
}
