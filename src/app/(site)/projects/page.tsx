import { PageTitle } from "@/components/PageTitle";
import { ProjectIndex } from "@/components/projects/ProjectIndex";
import { PROJECTS } from "@/config/content";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";
import { getServerDict } from "@/i18n/server";

export const generateMetadata = () => navMetadata("/projects");

export default async function Projects() {
  const t = await getServerDict();
  return (
    <>
      <PageTitle
        href="/projects"
        meta={`${String(PROJECTS.length).padStart(2, "0")} ${t.projects.entries}`}
        note={{ en: DICTS.en.projects.intro, pt: DICTS.pt.projects.intro, es: DICTS.es.projects.intro }}
      />
      <ProjectIndex />
    </>
  );
}
