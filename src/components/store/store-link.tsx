"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useHref } from "./store-context";

/** <Link> que funciona igual na loja e na pré-visualização do rascunho. */
export function StoreLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const toHref = useHref();
  if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" {...(props as ComponentProps<"a">)} />;
  return <Link href={toHref(href)} {...props} />;
}
