"use client";

import type { Project, Shot } from "@/config/content";
import type { Localized } from "@/i18n/config";
import { Swap } from "@/components/Swap";
import { useI18n } from "../I18nProvider";
import { MobileShot } from "./Device";

type Item = { shot: Shot; text?: { tag: Localized; title: Localized; line: Localized } };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * O projeto no celular, lado a lado: até três telas soltas no fundo, cada uma com o
 * nome da funcionalidade e uma linha embaixo (projetos sem `features` mostram só as
 * telas de `mobile`). No celular vira uma faixa que desliza para o lado.
 */
export function ProjectScreens({ project, label }: { project: Project; label: string }) {
  const { pick } = useI18n();
  const items: Item[] = project.features?.length
    ? project.features.slice(0, 3).map((f) => ({ shot: f.shot, text: { tag: f.tag, title: f.title, line: f.line ?? f.body } }))
    : (project.mobile?.slice(0, 3).map((shot) => ({ shot })) ?? []);
  if (!items.length) return null;

  return (
    <section className="mt-16 nav:mt-20" aria-label={label}>
      <header data-reveal className="divider flex items-baseline justify-between gap-6 border-t border-line pt-6">
        <h2 className="label !text-fg">{label}</h2>
        <span className="label tabular-nums">{pad(items.length)}</span>
      </header>

      <ol
        data-reveal
        className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] @[48rem]:mx-0 @[48rem]:grid @[48rem]:grid-cols-3 @[48rem]:gap-10 @[48rem]:overflow-visible @[48rem]:px-0"
      >
        {items.map((it, i) => (
          <li key={it.shot.src} data-probe={`screen-${i + 1}`} className="w-[68%] shrink-0 snap-start @[48rem]:w-auto">
            <MobileShot src={it.shot.src} alt={pick(it.shot.alt)} sizes="(min-width: 900px) 18vw, 60vw" className="w-[86%] @[48rem]:w-[74%]" />
            {it.text ? (
              <div className="mt-6">
                <p className="label flex gap-[1ch]">
                  <span className="tabular-nums text-accent">F.{pad(i + 1)}</span>
                  <span>/</span>
                  <Swap v={it.text.tag} />
                </p>
                <h3 className="display mt-3 min-h-[calc(var(--fs)*var(--display-leading)*3)] text-balance @[48rem]:min-h-[calc(var(--fs)*var(--display-leading)*2)] [--fs:clamp(1.25rem,1.7vw,1.6rem)]">
                  <Swap block v={it.text.title} />
                </h3>
                <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-muted">
                  <Swap block v={it.text.line} />
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
