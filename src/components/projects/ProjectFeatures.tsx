"use client";

import type { Project } from "@/config/content";
import { Swap } from "@/components/Swap";
import { useI18n } from "../I18nProvider";
import { Phone } from "./Device";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Funcionalidades em destaque: uma por faixa, com o que ela faz escrito ao lado da
 * tela de celular em que acontece: o aparelho inteiro, centralizado no quadro, com a
 * mesma folga em cima e embaixo.
 */
export function ProjectFeatures({ project, letter, label }: { project: Project; letter: string; label: string }) {
  const { pick } = useI18n();
  const features = project.features;
  if (!features?.length) return null;

  return (
    <section className="mt-12" aria-label={label}>
      <header data-reveal className="divider flex items-baseline justify-between gap-6 border-t border-line pt-8">
        <h2 className="label !text-fg">
          <span className="text-accent">{letter}</span> — {label}
        </h2>
        <span className="label tabular-nums">{pad(features.length)}</span>
      </header>

      <ol>
        {features.map((f, i) => (
          <li
            key={i}
            data-reveal
            data-probe={`feature-${i + 1}`}
            className={`grid gap-8 py-10 min-[1100px]:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] min-[1100px]:items-center min-[1100px]:gap-14 min-[1100px]:py-14 ${
              i ? "divider border-t border-line" : ""
            }`}
          >
            <div>
              <p className="label flex gap-[1ch]">
                <span className="tabular-nums text-accent">F.{pad(i + 1)}</span>
                <span>/</span>
                <Swap v={f.tag} />
              </p>
              {/* sempre duas linhas reservadas: a quebra do título muda com a fonte do tema */}
              <h3 className="display mt-5 min-h-[calc(var(--fs)*var(--display-leading)*2)] text-balance [--fs:clamp(1.5rem,2.7vw,2.6rem)]">
                <Swap block v={f.title} />
              </h3>
              <p className="mt-5 max-w-[46ch] text-[clamp(15px,1.1vw,17px)] leading-relaxed text-fg">
                <Swap block v={f.body} />
              </p>
              {f.points?.length ? (
                <ul className="mt-6 grid gap-2 font-mono text-[12px] leading-relaxed text-muted">
                  {f.points.map((pt, j) => (
                    <li key={j} className="flex gap-[1ch]">
                      <span className="text-accent" aria-hidden="true">
                        +
                      </span>
                      <Swap block v={pt} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <figure className="relative grid place-items-center border border-line-strong bg-surface py-[9%]">
              <Phone src={f.shot.src} alt={pick(f.shot.alt)} sizes="(min-width: 1100px) 22vw, 60vw" className="w-[56%]" />
              <figcaption className="label absolute left-3 top-2.5 !text-[10px]">
                <span className="text-accent">390</span> × 844
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
