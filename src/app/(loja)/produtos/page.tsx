import type { Metadata } from "next";
import { Suspense } from "react";

import { ListingView, parseListingParams } from "@/components/store/views/listing-view";

export const metadata: Metadata = {
  title: "Laços e acessórios",
  description: "Laços de cabelo, faixinhas baby, parzinhos e kits feitos à mão.",
};

function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8" aria-busy>
      <div className="h-12 w-64 animate-pulse rounded-full bg-muted" />
      <div className="grid-products mt-10">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[var(--radius)] bg-muted" />
        ))}
      </div>
    </div>
  );
}

async function Listing({ searchParams }: { searchParams: PageProps<"/produtos">["searchParams"] }) {
  return <ListingView params={parseListingParams(await searchParams)} />;
}

export default function ProdutosPage({ searchParams }: PageProps<"/produtos">) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Listing searchParams={searchParams} />
    </Suspense>
  );
}
