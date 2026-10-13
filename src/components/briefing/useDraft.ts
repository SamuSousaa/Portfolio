"use client";

import { useCallback, useEffect, useState } from "react";
import type { Respostas } from "@/briefings/types";

export type Fase = "abertura" | "pergunta" | "resumo" | "enviado";
export type Rascunho = { respostas: Respostas; extra: string; fase: Fase; chave: string | null; salvoEm: number };

const chaveDe = (slug: string) => `briefing:${slug}`;

/**
 * Rascunho no navegador (localStorage), para ela continuar depois se fechar a aba.
 * `inicial` é o que estava salvo ao abrir a página (undefined enquanto não leu).
 */
export function useDraft(slug: string) {
  const [inicial, setInicial] = useState<Rascunho | null | undefined>(undefined);
  const [salvoEm, setSalvoEm] = useState<number | null>(null);

  useEffect(() => {
    let lido: Rascunho | null = null;
    try {
      const bruto = JSON.parse(localStorage.getItem(chaveDe(slug)) ?? "null");
      if (bruto && typeof bruto.respostas === "object" && bruto.respostas) lido = bruto;
    } catch {}
    setInicial(lido);
    setSalvoEm(lido?.salvoEm ?? null);
  }, [slug]);

  const salvar = useCallback(
    (r: Omit<Rascunho, "salvoEm">) => {
      const salvoEm = Date.now();
      try {
        localStorage.setItem(chaveDe(slug), JSON.stringify({ ...r, salvoEm }));
        setSalvoEm(salvoEm);
      } catch {}
    },
    [slug],
  );

  const apagar = useCallback(() => {
    try {
      localStorage.removeItem(chaveDe(slug));
    } catch {}
    setInicial(null);
    setSalvoEm(null);
  }, [slug]);

  return { inicial, salvoEm, salvar, apagar };
}
