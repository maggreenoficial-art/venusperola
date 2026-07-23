"use client";

import { ClubVenusSignup } from "@/components/ClubVenusSignup";
import { VenusIcon } from "@/components/VenusIcon";
import { PearlsDisplay } from "@/components/PearlsDisplay";
import { UnboxingExperience } from "@/components/UnboxingExperience";
import { useLoyalty } from "@/context/LoyaltyContext";
import { loyalty } from "@/lib/loyalty";
import { brand } from "@/lib/brand";
import Link from "next/link";

export function ClubVenusContent() {
  const { pearls, isMember, email } = useLoyalty();

  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
      <div className="flex flex-col items-center">
        <VenusIcon className="h-28 w-28 text-accent sm:h-32 sm:w-32" />

        <p className="mt-6 text-center text-xs tracking-[0.3em] text-accent uppercase">
          Comunidade exclusiva
        </p>
        <h1 className="mt-3 text-center font-serif text-3xl italic sm:text-4xl">
          Clube Vênus
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed text-muted">
          Faça parte de uma comunidade de mulheres que desmistificam o prazer,
          compartilham bem-estar sexual e são recompensadas por investir em si
          mesmas.
        </p>
      </div>

      <div className="mt-12 rounded border border-white/10 bg-white/[0.02] p-8">
        <p className="text-center text-[10px] tracking-[0.25em] text-muted uppercase">
          Suas Pérolas de Fidelidade
        </p>

        <div className="mt-6 flex justify-center">
          <PearlsDisplay count={isMember ? pearls : 0} size="lg" />
        </div>

        {isMember ? (
          <p className="mt-4 text-center text-xs text-muted">
            Membra desde · <span className="text-accent">{email}</span>
          </p>
        ) : (
          <p className="mt-4 text-center text-xs text-muted">
            Entre no clube e ganhe {loyalty.welcomeBonus} pérolas de boas-vindas
          </p>
        )}
      </div>

      <div className="mt-10">
        <ClubVenusSignup />
      </div>

      <section className="mt-16 border-t border-white/10 pt-16">
        <h2 className="font-serif text-xl italic">{loyalty.programName}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Ganhe{" "}
          <strong className="text-white">
            1 pérola a cada R${loyalty.earnThreshold}
          </strong>{" "}
          em compras. Acumule e troque por descontos reais na loja.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-white/10 p-5 text-center">
            <div className="flex justify-center">
              <PearlsDisplay count={1} size="sm" maxVisible={1} compact />
            </div>
            <p className="mt-3 text-xs font-bold tracking-widest uppercase">
              Ganhe
            </p>
            <p className="mt-1 text-[10px] text-muted">
              1 pérola / R${loyalty.earnThreshold}
            </p>
          </div>
          <div className="border border-white/10 p-5 text-center">
            <div className="flex justify-center">
              <PearlsDisplay count={loyalty.welcomeBonus} size="sm" maxVisible={5} compact />
            </div>
            <p className="mt-3 text-xs font-bold tracking-widest uppercase">
              Boas-vindas
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Pérolas ao entrar no clube
            </p>
          </div>
          <div className="border border-white/10 p-5 text-center">
            <p className="text-2xl text-accent">R${loyalty.redeemValue}</p>
            <p className="mt-2 text-xs font-bold tracking-widest uppercase">
              Resgate
            </p>
            <p className="mt-1 text-[10px] text-muted">
              A cada {loyalty.redeemRate} pérolas
            </p>
          </div>
        </div>
      </section>

      <div className="mt-16">
        <UnboxingExperience />
      </div>

      <section className="mt-16 border-t border-white/10 pt-12 text-center">
        <p className="text-sm text-muted">Pronta para descobrir seu tesouro?</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/mystery-box"
            className="rounded-full border border-white/20 px-6 py-2 text-xs tracking-widest uppercase transition-colors hover:border-accent"
          >
            Mystery Box
          </Link>
          <Link
            href="/colecoes/perola-secreta"
            className="rounded-full bg-white px-6 py-2 text-xs font-semibold tracking-widest text-black uppercase transition-colors hover:bg-accent"
          >
            Coleção Pérola Secreta
          </Link>
        </div>
      </section>

      <p className="mt-12 text-center text-[10px] text-white/30">
        {brand.name} · Seus dados nunca são compartilhados
      </p>
    </div>
  );
}
