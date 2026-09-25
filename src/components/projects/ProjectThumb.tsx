"use client";

import Image from "next/image";
import type { Project } from "@/config/content";
import { useI18n } from "../I18nProvider";

/**
 * Miniatura 16:10 da capa. Com capa: P&B que ganha cor quando o `group` pai
 * recebe hover. Sem capa: moldura tracejada com a inicial vazada, no lugar da foto.
 */
export function ProjectThumb({ project, sizes, className = "" }: { project: Project; sizes: string; className?: string }) {
  const { pick } = useI18n();
  return (
    <span className={`relative block aspect-[16/10] overflow-hidden border border-line-strong bg-surface ${className}`}>
      {project.cover ? (
        <Image
          src={project.cover.src}
          alt={pick(project.cover.alt)}
          fill
          sizes={sizes}
          className="object-cover object-top grayscale contrast-[1.05] transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center border border-dashed border-line-strong">
          <span className="display vazado [--fs:3rem] ![-webkit-text-stroke-color:var(--line-strong)]">{project.name.charAt(0)}</span>
        </span>
      )}
    </span>
  );
}
