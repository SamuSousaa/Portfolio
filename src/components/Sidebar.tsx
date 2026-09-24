"use client";

import { usePathname } from "next/navigation";
import { NAV, findNav, navNumber } from "@/config/nav";
import { PROFILE } from "@/config/content";
import { TransitionLink } from "./PageTransition";
import { Settings } from "./Settings";
import { SocialIcons } from "./Social";
import { Logo } from "./Logo";
import { useI18n } from "./I18nProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { t, pick } = useI18n();
  const activeIndex = findNav(pathname)?.index ?? -1;
  const year = new Date().getFullYear();

  return (
    <aside className="vt-sidebar fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-line [--ring-gap:var(--c-surface)] nav:flex">
      {/* fundo em camada própria: troca na hora, enquanto os textos esmaecem */}
      <div className="vt-sidebar-bg absolute inset-0 -z-10 bg-[var(--c-surface)]" aria-hidden="true" />
      <div className="flex h-14 shrink-0 items-center border-b border-line px-6">
        <Logo />
      </div>

      <nav aria-label={t.a11y.mainNav} className="px-6 pt-10">
        <p className="label mb-5">{t.index}</p>
        <ul className="space-y-1">
          {NAV.map((item, i) => {
            const active = i === activeIndex;
            return (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 py-2 font-mono text-[13px] tracking-[0.12em] transition-colors duration-200 ${
                    active ? "text-accent" : "text-muted hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-px bg-accent transition-[width] duration-300 ${active ? "w-4" : "w-0 group-hover:w-2"}`}
                  />
                  <span>{navNumber(i)}.</span>
                  <span>{pick(item.label)}</span>
                </TransitionLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-6 pb-6">
        <SocialIcons className="mb-6" />
        <div className="border-t border-line pt-5">
          <Settings />
        </div>
        <div className="mt-6 space-y-1.5 border-t border-line pt-5">
          <p className="label !text-[10px]">
            {PROFILE.version} // {year}
          </p>
          <p className="label !text-[10px]">
            © {year} {PROFILE.firstName} {PROFILE.lastName}
          </p>
        </div>
      </div>
    </aside>
  );
}
