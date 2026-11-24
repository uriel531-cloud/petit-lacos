import type { DecorSettings } from "@/features/theme/schema";

/** Pseudoaleatório determinístico (mesmo resultado no servidor e no navegador). */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const COUNT = { pouca: 16, media: 32, muita: 56 } as const;

/**
 * Neve caindo ou estrelinhas piscando sobre a página (decoração sazonal).
 * Puramente decorativo: não recebe clique, é ignorado por leitores de tela
 * e desaparece para quem ativou "reduzir movimento".
 */
export function SeasonalDecor({ decor }: { decor: DecorSettings }) {
  if (decor.effect === "nenhum") return null;
  const total = COUNT[decor.intensity];

  return (
    <div className="decor-layer pointer-events-none fixed inset-0 z-[35] overflow-hidden" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const size = decor.effect === "neve" ? 6 + rand(i) * 10 : 8 + rand(i) * 10;
        const color = i % 3 === 0 ? decor.colorB : decor.colorA;
        const style = {
          left: `${rand(i + 1) * 100}%`,
          top: decor.effect === "estrelas" ? `${rand(i + 7) * 100}%` : undefined,
          width: size,
          height: size,
          color,
          animationDelay: `${-rand(i + 3) * 14}s`,
          animationDuration: decor.effect === "neve" ? `${9 + rand(i + 5) * 9}s` : `${2 + rand(i + 5) * 3}s`,
          ["--sway" as string]: `${(rand(i + 11) - 0.5) * 80}px`,
        } as React.CSSProperties;
        return (
          <span key={i} className={`decor-item ${decor.effect === "neve" ? "decor-snow" : "decor-star"} ${i % 2 ? "decor-desktop" : ""}`} style={style}>
            {decor.effect === "neve" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-full drop-shadow-[0_0_1px_rgb(0_0_0/0.18)]">
                <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 3 3-3M9 20l3-3 3 3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
                <path d="M12 0c.8 5.6 3.4 9.7 12 12-8.6 2.3-11.2 6.4-12 12-.8-5.6-3.4-9.7-12-12C8.6 9.7 11.2 5.6 12 0Z" />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Altura do fio no ponto x (arcos de 60px; curva quadrática com controle em 12 → máx. 7). */
function wireY(x: number) {
  const t = (x % 60) / 60;
  return 2 + 20 * t * (1 - t);
}

/** Varal pendurado embaixo do cabeçalho: luzinhas que piscam ou bandeirinhas (padrão que se repete, sem distorcer). */
export function Garland({ type }: { type: DecorSettings["garland"] }) {
  if (type === "nenhum") return null;
  const wire = "color-mix(in srgb, var(--foreground) 45%, transparent)";
  const colors = ["var(--primary)", "#D8B56A", "var(--announcement-bg)", "#E9CF86"];
  const patternId = `varal-${type}`;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full h-6 overflow-hidden" aria-hidden>
      <svg className="block h-6 w-full">
        <defs>
          <pattern id={patternId} width="120" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 2 Q30 12 60 2 Q90 12 120 2" fill="none" stroke={wire} strokeWidth="1.2" />
            {type === "luzinhas"
              ? [15, 45, 75, 105].map((x, i) => (
                  <g key={x} transform={`translate(${x} ${wireY(x)})`}>
                    <rect x="-1.6" y="0" width="3.2" height="3" rx="0.6" fill={wire} />
                    <ellipse
                      className="garland-bulb"
                      cx="0"
                      cy="7.5"
                      rx="3.2"
                      ry="4.6"
                      fill={colors[i]}
                      style={{ animationDelay: `${i * 0.35}s`, color: colors[i] }}
                    />
                  </g>
                ))
              : [30, 90].map((x, i) => (
                  <path
                    key={x}
                    d={`M${x - 13} ${wireY(x - 13)} L${x + 13} ${wireY(x + 13)} L${x} ${wireY(x) + 15} Z`}
                    fill={colors[i * 2]}
                    opacity="0.92"
                  />
                ))}
          </pattern>
        </defs>
        <rect width="100%" height="24" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
