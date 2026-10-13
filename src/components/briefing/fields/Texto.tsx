"use client";

import { LIMITES } from "@/briefings/logic";

type Props = {
  valor: string;
  onChange: (v: string) => void;
  longo?: boolean;
  placeholder?: string;
  /** id do título da pergunta (ou do rótulo do campo) */
  rotuloId: string;
  erroId?: string;
  invalido?: boolean;
  foco?: boolean;
  pequeno?: boolean;
  tipo?: "text" | "email" | "tel" | "url" | "date";
};

const TECLADO = { text: undefined, email: "email", tel: "tel", url: "url", date: undefined } as const;
const AUTO = { text: "off", email: "email", tel: "tel", url: "off", date: "off" } as const;

/** Texto curto, texto longo e os campos simples dos grupos (e-mail, telefone, link, data). */
export function Texto({ valor, onChange, longo, placeholder, rotuloId, erroId, invalido, foco, pequeno, tipo = "text" }: Props) {
  const comum = {
    value: valor,
    placeholder,
    "aria-labelledby": rotuloId,
    "aria-describedby": erroId,
    "aria-invalid": invalido || undefined,
    "data-autofocus": foco || undefined,
    className: `bf-input ${pequeno ? "bf-input--sm" : ""}`,
  };
  if (longo) {
    return <textarea {...comum} rows={3} maxLength={LIMITES.longo} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <input
      {...comum}
      // "url" e "email" nativos reclamam do formato antes da hora; a validação é nossa
      type={tipo === "date" || tipo === "tel" ? tipo : "text"}
      inputMode={TECLADO[tipo]}
      autoComplete={AUTO[tipo]}
      autoCapitalize={tipo === "text" ? undefined : "none"}
      spellCheck={tipo === "text" ? undefined : false}
      maxLength={tipo === "url" ? LIMITES.link : LIMITES.texto}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
