import { NextResponse } from "next/server";
import { handleOrderStatusChange } from "@/lib/db/affiliates";
import { getAllOrders, getOrderById, updateOrderStatus } from "@/lib/db/orders";
import type { OrderStatus } from "@/lib/orders";

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Erro ao listar pedidos." }, { status: 500 });
  }
}

interface PatchBody {
  id: string;
  status: OrderStatus;
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PatchBody;
    const previous = await getOrderById(body.id);
    const order = await updateOrderStatus(body.id, body.status);
    if (order && previous) {
      await handleOrderStatusChange(body.id, body.status, previous.status);
    }
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}
