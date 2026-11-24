/**
 * Efeitos de "adicionar ao carrinho" (aba Animações):
 *  - voar: miniatura do laço voa até a sacola
 *  - pulso: a sacola pula
 *  - confete: lacinhos discretos saindo do botão
 * Tudo com Web Animations API e desligado com "reduzir movimento".
 */
import type { MotionSettings } from "@/features/theme/schema";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cartTarget(): HTMLElement | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return targets.find((el) => el.offsetParent !== null) ?? targets[0] ?? null;
}

function pulseCart() {
  cartTarget()?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" },
  );
}

function flyToCart(source: HTMLElement | null, imageUrl: string | null) {
  const target = cartTarget();
  if (!source || !target) return pulseCart();
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 140);

  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    backgroundColor: "var(--surface-alt)",
    backgroundImage: imageUrl ? `url("${imageUrl}")` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "var(--shadow-hover)",
    zIndex: "100",
    pointerEvents: "none",
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(0.55)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.6 },
    ],
    { duration: 750, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
  );
  animation.onfinish = () => {
    ghost.remove();
    pulseCart();
  };
}

const BOW_SVG =
  '<svg viewBox="0 0 24 14" width="18" height="11" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 7c-2-3-6-6-9-6C1 1 0 3 0 7s1 6 3 6c3 0 7-3 9-6Zm0 0c2-3 6-6 9-6 2 0 3 2 3 6s-1 6-3 6c-3 0-7-3-9-6Z"/><circle cx="12" cy="7" r="2.2" fill="currentColor"/></svg>';

function confetti(source: HTMLElement | null) {
  if (!source) return;
  const r = source.getBoundingClientRect();
  const colors = ["var(--primary)", "var(--brand)", "var(--highlight)", "var(--sale)"];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement("span");
    el.innerHTML = BOW_SVG;
    Object.assign(el.style, {
      position: "fixed",
      left: `${r.left + r.width / 2}px`,
      top: `${r.top + r.height / 2}px`,
      color: colors[i % colors.length]!,
      zIndex: "100",
      pointerEvents: "none",
    });
    document.body.appendChild(el);
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const dist = 50 + Math.random() * 50;
    el.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg) scale(0.6)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist - 30}px)) rotate(${Math.random() * 360}deg) scale(1)`,
          opacity: 0,
        },
      ],
      { duration: 800 + Math.random() * 300, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
    ).onfinish = () => el.remove();
  }
}

export function playAddToCart(m: MotionSettings, source: HTMLElement | null, imageUrl: string | null) {
  if (m.level === "nenhum" || prefersReducedMotion()) return;
  if (m.addToCart === "voar") flyToCart(source, imageUrl);
  else if (m.addToCart === "pulso") pulseCart();
  if (m.confetti) confetti(source);
}
