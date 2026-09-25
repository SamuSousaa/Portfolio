import { About } from "@/components/about/About";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = () => navMetadata("/about");

/** O cabeçalho fica dentro de About: título, foto, bio e ficha cabem juntos na primeira tela. */
export default function AboutPage() {
  return <About />;
}
