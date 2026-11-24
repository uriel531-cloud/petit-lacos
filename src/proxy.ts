import { NextResponse, type NextRequest } from "next/server";

/**
 * Verificação rápida ("otimista") do painel: sem cookie de sessão, vai para o login.
 * A checagem de verdade (sessão válida + permissão) acontece no servidor em cada página e ação.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (!request.cookies.has("pl_sessao")) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("proximo", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
