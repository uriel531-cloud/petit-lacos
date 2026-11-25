import Link from "next/link";

export function NoProductPermission() {
  return (
    <div className="p-10">
      <h1 className="text-3xl">Sem permissão</h1>
      <p className="mt-2 text-muted-foreground">Peça para a dona da loja liberar o cadastro de produtos.</p>
      <Link href="/admin" className="mt-4 inline-block text-primary underline">
        Voltar
      </Link>
    </div>
  );
}
