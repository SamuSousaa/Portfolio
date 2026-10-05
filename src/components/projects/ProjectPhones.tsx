"use client";

import type { Project } from "@/config/content";
import { useI18n } from "../I18nProvider";
import { Phone } from "./Device";

/**
 * O projeto no celular: até três telas em pé lado a lado, inteiras e centralizadas no
 * quadro (mesma folga em cima e embaixo). Para projetos sem a seção de funcionalidades.
 */
export function ProjectPhones({ project, letter, label }: { project: Project; letter: string; label: string }) {
  const { pick } = useI18n();
  const phones = project.mobile?.slice(0, 3);
  if (!phones?.length) return null;

  return (
    <section className="mt-12" aria-label={label}>
      <h2 data-reveal className="label divider border-t border-line pt-8 !text-fg">
        <span className="text-accent">{letter}</span> — {label}
      </h2>
      <figure
        data-reveal
        data-probe="phones"
        className="relative mt-8 flex items-center justify-center gap-[4%] border border-line-strong bg-surface px-[4%] py-[11%] nav:gap-[6%] nav:py-[6%]"
      >
        {phones.map((p) => (
          <Phone
            key={p.src}
            src={p.src}
            alt={pick(p.alt)}
            sizes="(min-width: 900px) 20vw, 30vw"
            className="w-[29%] shrink-0 nav:w-[22%]"
          />
        ))}
        <figcaption className="label absolute left-3 top-2.5 !text-[10px]">
          <span className="text-accent">390</span> × 844
        </figcaption>
      </figure>
    </section>
  );
}
