import Link from "next/link";
import {
  wellnessPositioning,
  techHighlights,
  diversityContent,
  socialImpact,
  faqs,
} from "@/lib/marketing";
import { getCatalogProductBySlug, formatPrice, getMinPrice } from "@/lib/catalog";

export function WellnessHero() {
  return (
    <section className="page-section pt-6 pb-16 sm:pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Sexual Wellness
        </p>
        <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl">
          {wellnessPositioning.headline}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {wellnessPositioning.subheadline}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          {wellnessPositioning.description}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {wellnessPositioning.pillars.map((p) => (
          <div key={p.id} className="border border-white/10 p-6 text-center">
            <h2 className="text-sm font-medium">{p.title}</h2>
            <p className="mt-2 text-xs text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TechInnovationSection() {
  return (
    <section className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Inovação tecnológica
        </p>
        <h2 className="mt-2 font-serif text-3xl italic">
          Tecnologia a serviço do prazer
        </h2>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Inspirados em We-Vibe e LELO — produtos com app, aquecimento inteligente
          e estimulação de precisão.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {techHighlights.map((t) => {
            const product = getCatalogProductBySlug(t.productSlug);
            return (
              <div key={t.title} className="border border-white/10 p-6">
                <h3 className="font-medium">{t.title}</h3>
                <p className="mt-2 text-xs text-muted">{t.description}</p>
                {product && (
                  <Link
                    href={`/produto/${product.slug}`}
                    className="mt-4 inline-block text-xs text-accent hover:underline"
                  >
                    {product.name} — a partir de {formatPrice(getMinPrice(product))}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function DiscretionSection() {
  return (
    <section id="discrecao" className="px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Envio discreto
        </p>
        <h2 className="mt-2 font-serif text-3xl italic">
          Privacidade total, do clique à entrega
        </h2>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          {[
            { t: "Embalagem neutra", d: "Caixa sem logotipos ou menção ao conteúdo." },
            { t: "Fatura discreta", d: "Cobrança como VP Comercio Online." },
            { t: "Unboxing premium", d: "Por dentro, ritual de joia com perfume e bilhete." },
          ].map((item) => (
            <div key={item.t} className="border border-white/10 p-4">
              <p className="text-sm font-medium">{item.t}</p>
              <p className="mt-1 text-xs text-muted">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiversitySection() {
  return (
    <section id="inclusao" className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Diversidade & inclusão
        </p>
        <h2 className="mt-2 font-serif text-3xl italic">
          {diversityContent.headline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {diversityContent.text}
        </p>
        <ul className="mt-8 space-y-3">
          {diversityContent.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SocialImpactSection() {
  return (
    <section id="impacto" className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Impacto social
        </p>
        <h2 className="mt-2 font-serif text-3xl italic">
          {socialImpact.headline}
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-muted">{socialImpact.text}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {socialImpact.causes.map((c) => (
            <div key={c.title} className="border border-accent/20 bg-accent/5 p-6">
              <h3 className="text-sm font-medium">{c.title}</h3>
              <p className="mt-2 text-xs text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section id="comunidade" className="px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Comunidade sex-positive
        </p>
        <h2 className="mt-2 font-serif text-3xl italic">
          Criadores que educam, não estigmatizam
        </h2>
        <p className="mt-4 text-sm text-muted">
          Parcerias com influenciadores que promovem saúde sexual, empoderamento
          e informação de qualidade — no Instagram, TikTok e além.
        </p>
        <Link
          href="/clube-venus"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-xs font-semibold tracking-widest text-black uppercase hover:bg-accent"
        >
          Entrar no Clube Vênus
        </Link>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-serif text-3xl italic">
          Perguntas frequentes
        </h2>
        <dl className="mt-10 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-white/10 pb-6">
              <dt className="text-sm font-medium">{faq.q}</dt>
              <dd className="mt-2 text-sm text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
