import Image, { type ImageProps } from "next/image";

/**
 * Imagens do próprio site usam next/image (otimizadas). Endereços externos
 * digitados no editor usam <img> comum, para não exigir configuração de domínio.
 */
export function SmartImage({ src, alt, fill, className, sizes, priority, style, width, height }: ImageProps & { src: string }) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        style={style}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL externa informada no editor
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
      width={fill ? undefined : (width as number | undefined)}
      height={fill ? undefined : (height as number | undefined)}
    />
  );
}

/** Quando o produto ainda não tem foto: o laço da marca sobre o fundo do card. */
export function BowPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 grid place-items-center ${className}`} aria-hidden>
      <svg viewBox="0 0 48 28" className="w-2/5 text-[color-mix(in_srgb,var(--foreground)_18%,transparent)]">
        <path
          fill="currentColor"
          d="M24 14C20 8 12 2 6 2 2 2 0 6 0 14s2 12 6 12c6 0 14-6 18-12Zm0 0c4-6 12-12 18-12 4 0 6 4 6 12s-2 12-6 12c-6 0-14-6-18-12Z"
        />
        <circle cx="24" cy="14" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}
