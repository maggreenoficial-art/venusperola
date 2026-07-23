import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ShippingProvider } from "@/context/ShippingContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { AuthProvider } from "@/context/AuthContext";
import { StoreShell } from "@/components/StoreShell";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { MetaPixel } from "@/components/MetaPixel";
import { brand } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  referrer: "no-referrer",
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.concept,
  keywords: [
    "sexual wellness",
    "bem-estar íntimo",
    "saúde sexual feminina",
    "vênus pérola",
    "prazer feminino",
    "vibrador",
    "estimulador clitoriano",
    "entrega discreta",
    "autocuidado íntimo",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <MetaPixel />
        <AuthProvider>
          <LoyaltyProvider>
            <CartProvider>
              <ShippingProvider>
                <AnalyticsProvider>
                  <StoreShell>{children}</StoreShell>
                </AnalyticsProvider>
              </ShippingProvider>
            </CartProvider>
          </LoyaltyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
