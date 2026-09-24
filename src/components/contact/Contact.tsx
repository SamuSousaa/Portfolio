"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT, PROFILE } from "@/config/content";
import { useIntro } from "@/lib/useIntro";
import { HudStatus } from "../Hud";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";

/* última coluna fixa: cabe [ COPIAR ] + [ ENVIAR ] e mantém os endereços alinhados entre as linhas */
const COLS = "nav:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.6fr)_20rem]";

/** URL sem protocolo nem barra final, separada em [caminho, usuário]: "github.com/", "Fulano" */
const splitUrl = (url: string) => {
  const clean = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
  const cut = clean.lastIndexOf("/") + 1;
  return [clean.slice(0, cut), clean.slice(cut)];
};

/** Hora de Parnaíba, não a do visitante. Traços no servidor (sem divergência de hidratação). */
function LocalTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: PROFILE.location.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums">
      {now ?? "--:--:--"} <span className="text-muted">{PROFILE.location.utc}</span>
    </span>
  );
}

type Stage = "hidden" | "check" | "shown";

/**
 * E-mail revelado por desafio (receita 9): o endereço não está no HTML e só é
 * montado depois da conta certa. Filtro contra coleta automática, não segurança.
 */
function EmailChannel() {
  const { t, tr } = useI18n();
  const c = t.contact;
  const [stage, setStage] = useState<Stage>("hidden");
  const [sum, setSum] = useState<[number, number]>([0, 0]);
  const [value, setValue] = useState("");
  /** Índice da frase de erro sorteada; null = sem erro */
  const [wrong, setWrong] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const email = stage === "shown" ? [CONTACT.email.user, CONTACT.email.domain].join("@") : null;

  const start = () => {
    setSum([2 + Math.floor(Math.random() * 8), 1 + Math.floor(Math.random() * 9)]);
    setStage("check");
  };
  useEffect(() => {
    if (stage === "check") input.current?.focus();
  }, [stage]);

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(value) === sum[0] + sum[1]) setStage("shown");
    else {
      // sorteia outra frase, diferente da anterior
      setWrong((prev) => {
        const n = c.wrong.length;
        const next = Math.floor(Math.random() * (prev === null ? n : n - 1));
        return prev !== null && next >= prev ? next + 1 : next;
      });
      setValue("");
      input.current?.focus();
    }
  };

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <li data-intro="fade" className="border-b border-line">
      <div className={`grid gap-3 px-2 py-6 nav:items-center nav:gap-6 nav:py-7 ${COLS}`}>
        <span className="label">01</span>
        <span className="display [--fs:clamp(2.25rem,4vw,3.25rem)]">E-MAIL</span>

        <div className="flex min-h-[2.75rem] flex-col justify-center font-mono text-[13px]" aria-live="polite">
          {stage === "hidden" ? (
            <p className="text-muted">
              <span className="text-accent">$</span> ••••••••@••••• <span className="text-[11px]">// <Swap v={tr((d) => d.contact.hidden)} /></span>
            </p>
          ) : null}

          {stage === "check" ? (
            <form onSubmit={verify} className="flex flex-col gap-2">
              <p className="label">{c.check}</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-fg">
                  <span>
                    <span className="text-accent">$</span> echo $(({sum[0]} + {sum[1]}))
                  </span>
                  <input
                    ref={input}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value.replace(/\D/g, ""));
                      setWrong(null);
                    }}
                    inputMode="numeric"
                    maxLength={2}
                    aria-label={c.answer}
                    aria-invalid={wrong !== null || undefined}
                    className={`w-14 border bg-transparent px-2 py-1.5 text-center text-fg outline-none transition-colors focus:border-accent ${wrong !== null ? "border-accent" : "border-line-strong"}`}
                  />
                </label>
                <button type="submit" className="font-mono text-[11px] tracking-[0.14em] text-fg transition-colors hover:text-accent">
                  <Swap v={tr((d) => d.contact.verify)} />
                </button>
              </div>
              {wrong !== null ? <p className="text-[12px] text-accent">{c.wrong[wrong]}</p> : null}
            </form>
          ) : null}

          {email ? (
            <a href={`mailto:${email}`} className="break-all text-[clamp(14px,1.3vw,18px)] text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
              {email}
            </a>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 nav:justify-end">
          {stage === "hidden" ? (
            <button type="button" onClick={start} className="btn-bracket btn-primary">
              <Swap v={tr((d) => d.contact.reveal)} />
            </button>
          ) : null}
          {email ? (
            <>
              <button type="button" onClick={copy} className="btn-bracket">
                {/* os dois rótulos ocupam a mesma célula: trocar não muda a largura */}
                <span className="inline-grid">
                  <span className={`[grid-area:1/1] ${copied ? "invisible" : ""}`}>
                    <Swap v={tr((d) => d.contact.copy)} />
                  </span>
                  <span className={`[grid-area:1/1] ${copied ? "" : "invisible"}`} aria-live="polite">
                    <Swap v={tr((d) => d.contact.copied)} />
                  </span>
                </span>
              </button>
              <a href={`mailto:${email}`} className="btn-bracket btn-primary">
                <Swap v={tr((d) => d.contact.send)} />
                <span aria-hidden="true">↗</span>
              </a>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { t, tr } = useI18n();
  useIntro(ref);
  const c = t.contact;

  const info = [
    { label: c.status, value: <HudStatus /> },
    { label: c.localTime, value: <LocalTime /> },
    { label: c.base, value: PROFILE.location.city },
  ];

  const profiles = [
    { name: "GITHUB", href: CONTACT.github },
    { name: "LINKEDIN", href: CONTACT.linkedin },
  ];

  return (
    <section ref={ref} className="px-5 pb-20 nav:px-12" aria-label={c.channels}>
      <dl data-intro="fade" data-probe="contact-info" className="grid border-l border-t border-line sm:grid-cols-3">
        {info.map((item) => (
          <div key={item.label} className="border-b border-r border-line bg-surface px-5 py-5">
            <dt className="label mb-3">{item.label}</dt>
            <dd className="font-mono text-[13px] uppercase tracking-[0.08em] text-fg">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div data-intro="fade" className={`label mt-16 hidden border-b border-line-strong pb-3 nav:grid ${COLS} nav:gap-6`}>
        <span>#</span>
        <span>{c.colChannel}</span>
        <span>{c.colAddress}</span>
        <span />
      </div>

      <ol data-probe="channels" className="mt-10 border-t border-line-strong nav:mt-0 nav:border-t-0">
        <EmailChannel />
        {profiles.map((p, i) => (
          <li key={p.name} data-intro="fade" className="border-b border-line">
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              data-fill
              className={`group grid gap-3 px-2 py-6 transition-colors duration-200 hover:bg-accent hover:text-on-accent nav:items-center nav:gap-6 nav:py-7 ${COLS}`}
            >
              <span className="label group-hover:!text-on-accent">{String(i + 2).padStart(2, "0")}</span>
              <span className="display [--fs:clamp(2.25rem,4vw,3.25rem)] transition-transform duration-300 group-hover:translate-x-1.5">
                {p.name}
              </span>
              <span className="break-all font-mono text-[13px] text-muted group-hover:text-on-accent">
                {splitUrl(p.href)[0]}
                <span className="text-fg group-hover:text-on-accent">{splitUrl(p.href)[1]}</span>
              </span>
              <span className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] nav:justify-end">
                <Swap v={tr((d) => d.open)} />
                <span aria-hidden="true" className="text-lg transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>

      <p data-intro="fade" className="caret mt-8 font-mono text-[12px] text-muted">
        <span className="text-accent">$</span> ping {PROFILE.firstName.toLowerCase()} <span className="text-fg">→ 200 OK</span>
      </p>
    </section>
  );
}
