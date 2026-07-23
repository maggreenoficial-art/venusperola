"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_REFERRER_POLICY } from "@/lib/meta-pixel-config";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

function isTrackingExcludedPath(pathname: string) {
  return (
    pathname.startsWith("/gerenciaralojabt") ||
    pathname.startsWith("/afiliados/dashboard")
  );
}

export function MetaPixel() {
  const pathname = usePathname();

  if (!PIXEL_ID || isTrackingExcludedPath(pathname)) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        referrerPolicy={META_PIXEL_REFERRER_POLICY}
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.referrerPolicy='no-referrer';
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
          referrerPolicy={META_PIXEL_REFERRER_POLICY}
        />
      </noscript>
    </>
  );
}

export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq || !PIXEL_ID) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, params ?? {});
  }
}

/**
 * Disparo manual do pixel (avançado) sem vazar Referer.
 * Equivalente à tag img/iframe com referrerpolicy="no-referrer".
 */
export function trackPixelFetch(
  event: string,
  params?: {
    value?: number;
    currency?: string;
    contentIds?: string[];
  }
) {
  if (!PIXEL_ID) return;

  const search = new URLSearchParams({
    id: PIXEL_ID,
    ev: event,
    noscript: "1",
  });

  if (params?.value != null) {
    search.set("cd[value]", String(params.value));
  }
  if (params?.currency) {
    search.set("cd[currency]", params.currency);
  }
  if (params?.contentIds?.length) {
    search.set("cd[content_ids]", JSON.stringify(params.contentIds));
  }

  void fetch(`https://www.facebook.com/tr?${search}`, {
    mode: "no-cors",
    referrerPolicy: "no-referrer",
  });
}
