import type { Metadata } from "next";
import { MysteryBoxPage } from "@/components/MysteryBoxPage";

export const metadata: Metadata = {
  title: "Mystery Box — Caixa Misteriosa",
  description:
    "Surpresa curada com produto premium, brinde sensorial e ritual de unboxing completo.",
};

export default function MysteryBoxRoute() {
  return <MysteryBoxPage />;
}
