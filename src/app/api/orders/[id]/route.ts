import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/db/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
}
