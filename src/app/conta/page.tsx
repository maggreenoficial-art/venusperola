import type { Metadata } from "next";
import { AccountPage } from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default function ContaPage() {
  return <AccountPage />;
}
