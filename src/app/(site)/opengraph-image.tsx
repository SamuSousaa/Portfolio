import { ImageResponse } from "next/og";
import { PROFILE, fullName } from "@/config/content";
import { LOGO_H, LOGO_PATH, LOGO_W } from "@/components/LogoMark";

/*
 * Imagem de compartilhamento (1200×630), gerada no build com a cara do tema
 * TERMINAL: preto de fósforo, grid de 40 px, acento limão, Aldrich + JetBrains Mono.
 */
export const alt = `${fullName} — ${PROFILE.role.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0A0A0A";
const FG = "#EDEDED";
const MUTED = "#7A7A7A";
const ACCENT = "#CCF200";

/** Baixa só os glifos usados, em TTF (o formato que o gerador aceita). Sem rede, usa a fonte padrão. */
async function googleFont(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const year = new Date().getFullYear();
  const top = `SYS.01 — PORTFOLIO / ${year}`;
  const bottom = `> ${PROFILE.role.en.toUpperCase()}`;
  const status = PROFILE.status.en.toUpperCase();
  const place = PROFILE.location.city.toUpperCase();
  const mono = [top, bottom, status, place, PROFILE.version].join("");
  const display = PROFILE.firstName + PROFILE.lastName;

  const [aldrich, jetbrains] = await Promise.all([googleFont("Aldrich", display), googleFont("JetBrains+Mono", mono)]);
  const fonts = [
    aldrich && { name: "Aldrich", data: aldrich, weight: 400 as const },
    jetbrains && { name: "JetBrains Mono", data: jetbrains, weight: 400 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 }[];

  const label = { fontFamily: "JetBrains Mono", fontSize: 20, letterSpacing: "0.12em", color: MUTED };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: BG,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: FG,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", ...label }}>
          <span style={{ display: "flex" }}>
            <span style={{ color: ACCENT }}>SYS.01</span>
            <span>{` ${top.slice(7)}`}</span>
          </span>
<svg width={Math.round((58 * LOGO_W) / LOGO_H)} height={58} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}>
            <path d={LOGO_PATH} fill={FG} fillRule="evenodd" />
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Aldrich", fontSize: 168, lineHeight: 0.9, marginLeft: -8 }}>
          <span>{PROFILE.firstName}</span>
          <span style={{ color: ACCENT }}>{PROFILE.lastName}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", ...label }}>
          <span style={{ color: FG }}>{bottom}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 12, background: ACCENT }} />
              {status}
            </span>
            <span>{place}</span>
          </span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
