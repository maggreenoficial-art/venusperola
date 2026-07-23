import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra com segurança e discrição.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
