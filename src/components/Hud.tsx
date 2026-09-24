"use client";

import { useEffect, useState } from "react";
import { PROFILE } from "@/config/content";
import { useI18n } from "./I18nProvider";
import { Swap } from "@/components/Swap";
const pad = (n: number) => String(n).padStart(2, "0");

export function HudStatus() {
  return (
    <span className="flex items-center gap-2">
      <span className="status-dot" aria-hidden="true" />
      <Swap v={PROFILE.status} />
    </span>
  );
}

/** Relógio ao vivo. Renderiza traços no servidor para não haver divergência de hidratação. */
export function HudClock({ dateless = false }: { dateless?: boolean }) {
  const { t } = useI18n();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";
  const date = now ? `${pad(now.getDate())} ${t.months[now.getMonth()]} ${now.getFullYear()}` : "-- --- ----";
  return (
    <span aria-hidden="true" className="tabular-nums">
      {dateless ? time : `${date} // ${time}`}
    </span>
  );
}

const coord = (v: number, pos: string, neg: string, digits: number) =>
  `${Math.abs(v).toFixed(digits)}° ${v >= 0 ? pos : neg}`;

export function HudCoords({ short = false }: { short?: boolean }) {
  const { lat, lng, city } = PROFILE.location;
  const d = short ? 2 : 4;
  return (
    <span title={city}>
      {short ? "" : "LAT "}
      {coord(lat, "N", "S", d)}
      {short ? " " : " · LONG "}
      {coord(lng, "E", "W", d)}
    </span>
  );
}
