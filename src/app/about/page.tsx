import { About } from "@/components/about/About";
import { PageTitle } from "@/components/PageTitle";
import { DICTS } from "@/i18n/ui";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/about");

export default function AboutPage() {
  return (
    <>
      <PageTitle href="/about" note={{ en: DICTS.en.about.intro, pt: DICTS.pt.about.intro, es: DICTS.es.about.intro }} />
      <About />
    </>
  );
}
