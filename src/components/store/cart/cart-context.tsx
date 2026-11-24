"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Carrinho no navegador (localStorage). Na Fase 4 ele passa a ser salvo no
 * servidor (tabela Cart) e ganha cupons; os preços SEMPRE serão recalculados
 * no servidor no checkout.
 */
export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string | null;
  priceCents: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "petit-carrinho";
const WISHLIST_KEY = "petit-favoritos";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // modo privado / armazenamento bloqueado: o carrinho funciona só nesta aba
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação do localStorage após montar
    setItems(readStorage<CartItem[]>(CART_KEY, []));
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(CART_KEY, items);
  }, [items, loaded]);

  useEffect(() => {
    if (loaded) writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist, loaded]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + quantity, Math.max(item.maxStock, 1)) } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, Math.max(item.maxStock, 1)) }];
    });
  }, []);

  const update = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, Math.max(i.maxStock, 1)) } : i)),
    );
  }, []);

  const remove = useCallback((variantId: string) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);
  const toggleWishlist = useCallback(
    (productId: string) => setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId])),
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotalCents: items.reduce((n, i) => n + i.priceCents * i.quantity, 0),
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
      wishlist,
      toggleWishlist,
    }),
    [items, open, add, update, remove, clear, wishlist, toggleWishlist],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
