"use client";

import { useEffect, useState } from "react";
import { CONTACT } from "@/config/content";

const icons = {
  github: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1.01 1.84-1.75 3.4-1.75 3.63 0 4.22 2.2 4.22 5.06v6.19h-4v-5.49c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9v5.59h-4v-11Z" />
  ),
  email: <path d="M3 5h18v14H3V5Zm2 2v.4l7 4.6 7-4.6V7H5Zm14 2.8-7 4.6-7-4.6V17h14V9.8Z" />,
};

/** O e-mail só é montado no cliente, para não ficar no HTML servido. */
function useEmail() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => setEmail([CONTACT.email.user, CONTACT.email.domain].join("@")), []);
  return email;
}

export function SocialIcons({ className = "" }: { className?: string }) {
  const email = useEmail();
  const links = [
    { key: "github" as const, label: "GitHub", href: CONTACT.github },
    { key: "linkedin" as const, label: "LinkedIn", href: CONTACT.linkedin },
    { key: "email" as const, label: "E-mail", href: email ? `mailto:${email}` : undefined },
  ];
  return (
    <ul className={`flex gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            target={l.key === "email" ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={l.label}
            data-fill
            className="grid size-9 place-items-center border border-line text-muted transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-on-accent"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              {icons[l.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Versão mínima em mono para o menu mobile. */
export function SocialText({ className = "" }: { className?: string }) {
  const email = useEmail();
  const links = [
    { label: "GH", title: "GitHub", href: CONTACT.github },
    { label: "IN", title: "LinkedIn", href: CONTACT.linkedin },
    { label: "MAIL", title: "E-mail", href: email ? `mailto:${email}` : undefined },
  ];
  return (
    <ul className={`flex justify-center gap-6 font-mono text-[12px] tracking-[0.14em] ${className}`}>
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target={l.label === "MAIL" ? undefined : "_blank"} rel="noreferrer" aria-label={l.title} className="text-muted transition-colors hover:text-accent">
            [ {l.label} ]
          </a>
        </li>
      ))}
    </ul>
  );
}
