/**
 * URLs enviadas ao Meta (pixel/CAPI) sem expor a página de oferta real.
 * Use NEXT_PUBLIC_META_EVENT_SOURCE_URL para definir a URL pública segura.
 */
export function getMetaEventSourceUrl(): string {
  const configured = process.env.NEXT_PUBLIC_META_EVENT_SOURCE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "") + "/";

  if (typeof window !== "undefined") {
    return `${window.location.origin}/`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.endsWith("/") ? site : `${site}/`;

  return "/";
}

/** Substitui URLs sensíveis antes de enviar ao Graph API */
export function sanitizeMetaEventSourceUrl(url?: string): string | undefined {
  if (!url) return getMetaEventSourceUrl();

  try {
    const parsed = new URL(url, "https://placeholder.local");
    const sensitive =
      /^\/(loja|checkout|produto|pedido|c\/|gerenciaralojabt)/.test(
        parsed.pathname
      ) || parsed.pathname.includes("/produto/");

    if (sensitive) {
      const safe = process.env.NEXT_PUBLIC_META_EVENT_SOURCE_URL?.trim();
      if (safe) return safe.endsWith("/") ? safe : `${safe}/`;
      return `${parsed.origin}/`;
    }

    return url;
  } catch {
    return getMetaEventSourceUrl();
  }
}

export const META_PIXEL_REFERRER_POLICY = "no-referrer" as const;
