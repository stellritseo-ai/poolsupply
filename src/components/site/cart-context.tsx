import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeShipping } from "@/lib/shipping";

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  img: string;
  qty: number;
  productSize?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "aquapro_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      add: (item, qty = 1) => {
        const effectivePrice =
          (item as any).salePrice && Number((item as any).salePrice) > 0
            ? Number((item as any).salePrice)
            : item.price;
        const normalizedItem = { ...item, price: effectivePrice };
        setItems((prev) => {
          const ex = prev.find((p) => p.id === item.id);
          if (ex)
            return prev.map((p) =>
              p.id === item.id ? { ...p, price: effectivePrice, qty: p.qty + qty } : p,
            );
          return [...prev, { ...normalizedItem, qty }];
        });
        setIsOpen(true);
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.id !== id)
            : prev.map((p) => (p.id === id ? { ...p, qty } : p)),
        ),
      clear: () => setItems([]),
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [items, isOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

// Pricing helpers
export const TAX_RATE = 0.0925; // 9.25% fixed TN sales tax

/**
 * Compute order totals with dynamic zone-based shipping.
 * zip and state are optional — when omitted the cart drawer shows a
 * zone-4 estimate ("Regional Ground" ~$X estimated).
 */
export function computeTotals(items: CartItem[], zip?: string, state?: string) {
  const result = computeShipping(items, zip ?? "", state ?? "");
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  const shipping = result.amount;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  return { shipping, tax, total, shippingResult: result };
}

export function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
