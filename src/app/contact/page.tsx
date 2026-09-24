import { Contact } from "@/components/contact/Contact";
import { PageTitle } from "@/components/PageTitle";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <PageTitle href="/contact" note={{ en: DICTS.en.contact.intro, pt: DICTS.pt.contact.intro, es: DICTS.es.contact.intro }} />
      <Contact />
    </>
  );
}
