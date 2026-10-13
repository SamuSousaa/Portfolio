import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/config/content";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { getServerLocale } from "@/i18n/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  const locale = await getServerLocale();
  return { title: project.name, description: project.description[locale] };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
