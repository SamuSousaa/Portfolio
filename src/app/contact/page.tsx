import { PageTitle } from "@/components/PageTitle";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/contact");

export default function Contact() {
  return <PageTitle href="/contact" note={{ en: DICTS.en.notes.contact, pt: DICTS.pt.notes.contact, es: DICTS.es.notes.contact }} />;
}
