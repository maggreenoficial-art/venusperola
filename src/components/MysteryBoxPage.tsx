"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { UnboxingExperience } from "@/components/UnboxingExperience";
import { formatPrice, getDefaultVariant } from "@/lib/catalog";
import { mysteryBox, mysteryBoxHints } from "@/lib/special-products";

export function MysteryBoxPage() {
  const [hintIndex, setHintIndex] = useState(0);
  const variant = getDefaultVariant(mysteryBox);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % mysteryBoxHints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-white/10 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="relative text-center">
            <p className="text-6xl">?</p>
            <p className="mt-4 font-serif text-2xl italic">Mystery Box</p>
            <p className="mt-2 text-xs tracking-[0.3em] text-accent uppercase">
              Conteúdo secreto
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs tracking-[0.25em] text-accent uppercase">
            Curiosidade · A Descoberta da Pérola
          </p>
          <h1 className="mt-2 font-serif text-3xl italic sm:text-4xl">
            {mysteryBox.name}
          </h1>
          <p className="mt-4 text-xl text-accent">{formatPrice(variant.price)}</p>

          <p className="mt-2 text-xs text-muted">
            Valor mínimo garantido: R$ 120,00 · {variant.stock} caixas disponíveis
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted">
            {mysteryBox.description}
          </p>

          <div className="mt-6 min-h-[2rem]">
            <p className="text-xs italic text-accent/80 transition-opacity">
              {mysteryBoxHints[hintIndex]}
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {mysteryBox.highlights.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/70"
              >
                {item}
              </li>
            ))}
          </ul>

          <AddToCartButton product={mysteryBox} variant={variant} />

          <div className="mt-8">
            <UnboxingExperience compact />
          </div>

          <Link
            href="/loja"
            className="mt-8 text-xs text-muted underline-offset-4 hover:text-white hover:underline"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <UnboxingExperience />
      </div>
    </div>
  );
}
