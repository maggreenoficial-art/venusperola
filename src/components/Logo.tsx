import Link from "next/link";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function Logo({ size = "sm", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "font-serif font-semibold tracking-tight text-white transition-opacity hover:opacity-80",
        size === "sm" ? "text-lg" : "text-4xl sm:text-5xl md:text-6xl",
        className
      )}
      aria-label={`${brand.name} - Página inicial`}
    >
      <span className="block leading-none italic">Vênus</span>
      <span
        className={cn(
          "block leading-none tracking-[0.15em]",
          size === "sm" ? "text-base" : "text-3xl sm:text-4xl md:text-5xl"
        )}
      >
        Pérola
      </span>
      {size === "lg" && (
        <span className="mt-4 block max-w-sm text-center text-xs font-sans font-normal not-italic tracking-[0.2em] text-accent sm:text-sm">
          {brand.tagline}
        </span>
      )}
    </Link>
  );
}
