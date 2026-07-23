import { NextResponse } from "next/server";
import { AFFILIATE_SESSION_COOKIE } from "@/lib/affiliates/cookie";

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AFFILIATE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
