"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), seg: s % 60 };
}

export function Countdown({ endsAt }: { endsAt: string | null }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const end = new Date(endsAt).getTime();
    const tick = () => setLeft(end - Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!endsAt) return <p className="text-sm text-muted-foreground">Defina a data de término no editor.</p>;
  if (left === null) return <div className="h-20" aria-hidden />;
  if (left <= 0) return <p className="font-semibold">Promoção encerrada.</p>;

  const p = parts(left);
  return (
    <ul className="flex justify-center gap-3" aria-live="off">
      {Object.entries(p).map(([label, value]) => (
        <li key={label} className="grid min-w-16 place-items-center rounded-[var(--radius)] bg-background/80 px-3 py-3 shadow-card">
          <span className="font-heading text-3xl tabular-nums md:text-4xl">{String(value).padStart(2, "0")}</span>
          <span className="text-xs tracking-wider text-muted-foreground uppercase">{label}</span>
        </li>
      ))}
    </ul>
  );
}
