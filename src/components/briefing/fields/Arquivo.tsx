"use client";

import { useRef, useState } from "react";
import { UPLOAD } from "@/briefings/logic";
import type { Arquivo as ArquivoEnviado } from "@/briefings/types";

type Props = { slug: string; valor?: ArquivoEnviado; onChange: (v: ArquivoEnviado | undefined) => void; rotulo: string };

const tamanho = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`);

/**
 * Upload em dois passos: a rota de API confere o arquivo e devolve uma URL
 * assinada; o navegador envia direto ao Storage. Na resposta fica só o caminho.
 */
export function Arquivo({ slug, valor, onChange, rotulo }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (file: File) => {
    setErro(null);
    if (!UPLOAD.tipos.includes(file.type)) return setErro("Envie uma imagem (PNG, JPG, WebP, SVG) ou um PDF.");
    if (file.size > UPLOAD.maxBytes) return setErro("O arquivo passa de 10 MB. Se preferir, cole um link.");
    setEnviando(true);
    try {
      const res = await fetch("/api/briefing/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, nome: file.name, tipo: file.type, tamanho: file.size }),
      });
      const dados = await res.json().catch(() => null);
      if (!res.ok || !dados?.ok) throw new Error(dados?.erro ?? "");
      // mesmo formato que o SDK do Supabase usa em uploadToSignedUrl
      const corpo = new FormData();
      corpo.append("cacheControl", "3600");
      corpo.append("", file);
      const envio = await fetch(dados.url, { method: "PUT", body: corpo });
      if (!envio.ok) throw new Error("");
      onChange({ caminho: dados.caminho, nome: file.name, tamanho: file.size });
    } catch (e) {
      setErro((e instanceof Error && e.message) || "Não consegui receber o arquivo agora. Se preferir, cole um link.");
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={UPLOAD.accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => e.target.files?.[0] && enviar(e.target.files[0])}
      />
      {valor ? (
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-line-strong px-4 py-3 text-[16px]">
          <span className="min-w-0 break-all">{valor.nome}</span>
          <span className="label">{tamanho(valor.tamanho)}</span>
          <button type="button" onClick={() => onChange(undefined)} className="bf-ghost ml-auto !min-h-0 underline underline-offset-4">
            Remover
          </button>
        </p>
      ) : (
        <button type="button" disabled={enviando} onClick={() => input.current?.click()} className="btn-bracket min-h-12 disabled:opacity-60" aria-label={rotulo}>
          {enviando ? "Enviando..." : "[ Escolher arquivo ]"}
        </button>
      )}
      <p className="mt-2 text-[14px] text-muted" aria-live="polite">
        {erro ? <span className="text-fg">{erro}</span> : valor ? null : "Imagem ou PDF, até 10 MB."}
      </p>
    </div>
  );
}
