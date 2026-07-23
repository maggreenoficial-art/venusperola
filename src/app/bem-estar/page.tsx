import type { Metadata } from "next";
import {
  WellnessHero,
  TechInnovationSection,
  DiscretionSection,
  DiversitySection,
  SocialImpactSection,
  CommunitySection,
  FaqSection,
} from "@/components/WellnessSections";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { EducationHub } from "@/components/EducationHub";

export const metadata: Metadata = {
  title: "Bem-Estar Íntimo & Sexual Wellness",
  description:
    "Saúde sexual, bem-estar e relacionamento com elegância. Guias educativos, envio discreto, diversidade e impacto social — Vênus Pérola.",
  keywords: [
    "sexual wellness",
    "bem-estar íntimo",
    "saúde sexual feminina",
    "prazer feminino",
    "entrega discreta",
    "autocuidado íntimo",
  ],
};

export default function BemEstarPage() {
  return (
    <>
      <WellnessHero />
      <EducationHub />
      <TechInnovationSection />
      <DiscretionSection />
      <DiversitySection />
      <CommunitySection />
      <SocialImpactSection />
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <NewsletterSignup />
      </div>
      <FaqSection />
    </>
  );
}
