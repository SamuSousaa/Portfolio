import { PageTitle } from "@/components/PageTitle";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/projects");

export default function Projects() {
  return <PageTitle href="/projects" note={{ en: DICTS.en.notes.projects, pt: DICTS.pt.notes.projects, es: DICTS.es.notes.projects }} />;
}
