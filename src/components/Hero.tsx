import { brand } from "@/lib/brand";
import { Logo } from "./Logo";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-16 sm:px-6 sm:pt-16 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-accent/5 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <Logo size="lg" className="relative text-center" />

      <p className="relative mt-10 max-w-xl text-center text-base leading-relaxed text-muted sm:text-lg">
        {brand.concept}
      </p>

      <div className="relative mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
        <Link
          href="/colecoes/perola-secreta"
          className="touch-target flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black uppercase transition-colors hover:bg-accent"
        >
          Coleção Pérola Secreta
        </Link>
        <Link
          href="/bem-estar"
          className="touch-target flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm tracking-widest text-white uppercase transition-colors hover:border-accent hover:text-accent"
        >
          Sexual Wellness
        </Link>
        <Link
          href="/loja"
          className="touch-target flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm tracking-widest text-white uppercase transition-colors hover:border-accent hover:text-accent"
        >
          Ver todos os produtos
        </Link>
      </div>
    </section>
  );
}
