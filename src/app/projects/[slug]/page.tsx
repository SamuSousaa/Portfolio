import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/config/content";
import { PageTitle } from "@/components/PageTitle";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: PROJECTS.find((p) => p.slug === slug)?.name };
}

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();
  return <PageTitle href={`/projects/${project.slug}`} title={project.name} note={project.description} />;
}
