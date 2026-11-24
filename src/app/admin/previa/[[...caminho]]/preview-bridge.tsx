"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Ponte entre o editor (janela pai) e a pré-visualização (iframe):
 *  - "tema-css": aplica cores/fontes/raios na hora, sem recarregar
 *  - "tema-atualizado": o rascunho foi salvo → re-renderiza mantendo a rolagem
 * Aberta numa aba própria ("Ver rascunho no site"), mostra um aviso fixo.
 */
export function PreviewBridge() {
  const router = useRouter();
  const [css, setCss] = useState("");
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só dá para saber se está num iframe no navegador
    setStandalone(window.self === window.top);
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; css?: string } | null;
      if (data?.type === "tema-css" && typeof data.css === "string") setCss(data.css);
      if (data?.type === "tema-atualizado") router.refresh();
    }
    window.addEventListener("message", onMessage);
    if (window.self !== window.top) window.parent.postMessage({ type: "previa-pronta" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <>
      {css ? <style id="tema-ao-vivo" dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {standalone ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-3 bg-[#1E3042] px-4 py-2.5 text-sm text-white">
          <span>
            Você está vendo o <strong>RASCUNHO</strong> — os clientes ainda veem a versão publicada.
          </span>
          <Link href="/admin/aparencia" className="rounded-full bg-white px-3 py-1 font-semibold text-[#1E3042]">
            Voltar ao editor
          </Link>
        </div>
      ) : null}
    </>
  );
}
