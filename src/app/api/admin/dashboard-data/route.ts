import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar dashboard." },
      { status: 500 }
    );
  }
}
