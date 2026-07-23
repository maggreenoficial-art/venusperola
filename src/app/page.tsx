import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { CollectionsHighlight } from "@/components/CollectionsHighlight";
import { ProductGrid } from "@/components/ProductGrid";
import { SinsSection } from "@/components/SinsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CreationsSection } from "@/components/CreationsSection";
import { ClubVenusCTA } from "@/components/ClubVenusCTA";
import { EducationHub } from "@/components/EducationHub";
import { MarketingPillars } from "@/components/MarketingPillars";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { getAllProducts } from "@/lib/catalog";

export default function HomePage() {
  const featured = getAllProducts().filter((p) => p.featured);

  return (
    <>
      <Hero />
      <TrustBadges />
      <CollectionsHighlight />
      <div className="mx-auto max-w-7xl">
        <ProductGrid
          products={featured}
          title="DESTAQUES DA LOJA:"
          showCount={false}
        />
      </div>
      <SinsSection />
      <TestimonialsSection />
      <EducationHub />
      <MarketingPillars />
      <CreationsSection />
      <div className="store-container pb-20">
        <NewsletterSignup />
      </div>
      <ClubVenusCTA />
    </>
  );
}
