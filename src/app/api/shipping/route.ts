import { NextResponse } from "next/server";
import { calculateCorreiosShipping } from "@/lib/shipping";
import type { ShippingServiceId } from "@/lib/correios";

interface ShippingBody {
  destinationCep?: string;
  itemCount?: number;
  subtotal?: number;
  selectedService?: ShippingServiceId;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShippingBody;
    const destinationCep = body.destinationCep?.replace(/\D/g, "") ?? "";

    if (destinationCep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
    }

    const itemCount = Math.max(1, body.itemCount ?? 1);
    const subtotal = Math.max(0, body.subtotal ?? 0);

    const result = await calculateCorreiosShipping({
      destinationCep,
      itemCount,
      subtotal,
      selectedService: body.selectedService,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erro ao calcular frete." },
      { status: 500 }
    );
  }
}
