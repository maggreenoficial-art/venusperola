import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/OrderConfirmation";

interface PedidoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Pedido confirmado",
};

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { id } = await params;
  return <OrderConfirmation orderId={id} />;
}
