import { trustBadges } from "@/lib/brand";
import { Shield, Package, Truck, Gem } from "lucide-react";

const icons = {
  discreta: Package,
  "body-safe": Shield,
  rapida: Truck,
  joia: Gem,
} as const;

export function TrustBadges() {
  return (
    <section className="border-y border-white/10 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustBadges.map((badge) => {
          const Icon = icons[badge.id as keyof typeof icons];
          return (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase">
                {badge.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
