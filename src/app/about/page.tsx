import { PageTitle } from "@/components/PageTitle";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/about");

export default function About() {
  return <PageTitle href="/about" note={{ en: DICTS.en.notes.about, pt: DICTS.pt.notes.about, es: DICTS.es.notes.about }} />;
}
