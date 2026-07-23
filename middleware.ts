import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser, updateSession } from "@/lib/supabase/middleware";
import { handleCampaignRoute } from "@/lib/traffic-shield/campaign-middleware";
import {
  runTrafficShield,
  VISITOR_COOKIE,
} from "@/lib/traffic-shield/middleware";
import {
  AFFILIATE_REF_COOKIE,
  AFFILIATE_REF_MAX_AGE,
} from "@/lib/affiliates/cookie";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/c/")) {
    const campaignResponse = await handleCampaignRoute(request);
    if (campaignResponse) return campaignResponse;
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  if (
    pathname === "/gerenciaralojabt/login" ||
    pathname === "/api/admin/auth" ||
    pathname === "/api/admin/setup-password"
  ) {
    return supabaseResponse;
  }

  if (
    pathname.startsWith("/gerenciaralojabt") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!user || !(await isAdminUser(supabase, user.id))) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }
      const login = new URL("/gerenciaralojabt/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    return supabaseResponse;
  }

  const shield = await runTrafficShield(request);

  if (shield.shouldBlock && shield.rewritePath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = shield.rewritePath;
    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set(VISITOR_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });
    response.headers.set("x-traffic-action", shield.analysis.action);
    response.headers.set("x-traffic-score", String(shield.analysis.score));
    return response;
  }

  if (shield.shouldBlock && shield.analysis.action === "block") {
    return new NextResponse(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Acesso restrito</title></head><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;max-width:400px;padding:2rem"><h1 style="font-weight:300">Acesso não disponível</h1><p style="color:#888;margin-top:1rem">Este conteúdo não está acessível para o seu perfil de navegação.</p></div></body></html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  const response = supabaseResponse;
  response.cookies.set(VISITOR_COOKIE, "1", {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
  });

  const refCode = request.nextUrl.searchParams.get("ref");
  if (refCode?.trim()) {
    const code = refCode.trim().toUpperCase();
    response.cookies.set(AFFILIATE_REF_COOKIE, code, {
      maxAge: AFFILIATE_REF_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    const trackUrl = new URL("/api/affiliates/track-click", request.url);
    void fetch(trackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        referer: request.headers.get("referer") ?? undefined,
        utmSource: request.nextUrl.searchParams.get("utm_source") ?? undefined,
      }),
    }).catch(() => {});
  }

  if (shield.analysis.action === "suspicious") {
    response.headers.set("x-traffic-action", "suspicious");
    response.headers.set("x-traffic-score", String(shield.analysis.score));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
