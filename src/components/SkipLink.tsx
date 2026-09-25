"use client";

import { useI18n } from "./I18nProvider";

/**
 * Primeiro item do Tab: invisível até ganhar foco, então aparece no canto e leva
 * direto ao <main>, pulando sidebar e topo. O foco vai junto (o Lenis não rola
 * sozinho por âncora).
 */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#conteudo"
      onClick={(e) => {
        const main = document.getElementById("conteudo");
        if (!main) return;
        e.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }}
      className="label fixed left-3 top-3 z-[9600] -translate-y-[200%] border border-accent bg-accent px-3 py-2 !text-on-accent focus-visible:translate-y-0"
    >
      {t.a11y.skip}
    </a>
  );
}
