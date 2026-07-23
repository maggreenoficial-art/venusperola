import { unboxing } from "@/lib/unboxing";
import { Gift, Sparkles, Mail, Droplets } from "lucide-react";

const icons = {
  caixa: Gift,
  perfume: Sparkles,
  bilhete: Mail,
  brinde: Droplets,
} as const;

interface UnboxingExperienceProps {
  compact?: boolean;
}

export function UnboxingExperience({ compact = false }: UnboxingExperienceProps) {
  if (compact) {
    return (
      <div className="rounded border border-accent/20 bg-accent/5 p-4">
        <p className="text-[10px] font-bold tracking-[0.15em] text-accent uppercase">
          Unboxing Premium incluso
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted">
          Caixa de joia · Perfume exclusivo · Bilhete selado · Brinde sensorial
        </p>
      </div>
    );
  }

  return (
    <section className="border border-white/10 p-6 sm:p-8">
      <p className="text-[10px] tracking-[0.25em] text-accent uppercase">
        {unboxing.subtitle}
      </p>
      <h2 className="mt-2 font-serif text-xl italic">{unboxing.title}</h2>
      <p className="mt-2 text-xs text-muted">
        Incluso em todos os pedidos Vênus Pérola
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {unboxing.items.map((item) => {
          const Icon = icons[item.id as keyof typeof icons];
          return (
            <li key={item.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/30">
                <Icon size={14} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
