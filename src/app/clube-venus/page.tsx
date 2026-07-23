import type { Metadata } from "next";
import { ClubVenusContent } from "@/components/ClubVenusContent";

export const metadata: Metadata = {
  title: "Clube Vênus",
  description:
    "Comunidade exclusiva com Pérolas de Fidelidade, conteúdos premium e brindes sensoriais.",
};

export default function ClubeVenusPage() {
  return <ClubVenusContent />;
}
