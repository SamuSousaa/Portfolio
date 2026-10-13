import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRIEFING_SLUGS, getBriefing } from "@/briefings";
import { Briefing } from "@/components/briefing/Briefing";
import { fullName } from "@/config/content";

type Props = { params: Promise<{ slug: string }> };

// só os slugs registrados em src/briefings existem; o resto é 404
export const dynamicParams = false;
export const generateStaticParams = () => BRIEFING_SLUGS.map((slug) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const briefing = getBriefing((await params).slug);
  return { title: briefing ? `${briefing.titulo} — ${fullName}` : "Briefing" };
}

export default async function BriefingPage({ params }: Props) {
  const briefing = getBriefing((await params).slug);
  if (!briefing) notFound();
  return <Briefing briefing={briefing} autor={fullName} />;
}
