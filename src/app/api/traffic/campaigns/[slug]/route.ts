import { NextResponse } from "next/server";
import { getCampaignBySlug } from "@/lib/db/traffic-campaigns";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const campaign = await getCampaignBySlug(slug);
    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
    }
    return NextResponse.json({
      slug: campaign.slug,
      status: campaign.status,
      safePageUrl: campaign.safePageUrl,
      offerPageUrl: campaign.offerPageUrl,
      deliveryMethod: campaign.deliveryMethod,
    });
  } catch {
    return NextResponse.json({ error: "Erro." }, { status: 500 });
  }
}
