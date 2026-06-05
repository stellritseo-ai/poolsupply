import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { computeTotals, formatUSD, useCart } from "./cart-context";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();
  const { shipping, tax, total } = computeTotals(subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-[oklch(0.18_0.02_256/0.45)] backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] bg-white shadow-[var(--shadow-float)] flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-[oklch(0.50_0.14_232)]" />
                <h2 className="font-bold tracking-tight text-lg">Your Cart</h2>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>
              <button aria-label="Close cart" onClick={close} className="size-9 grid place-items-center rounded-full hover:bg-muted transition">
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="size-16 rounded-full bg-muted grid place-items-center mb-4">
                    <ShoppingBag className="size-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                    Browse our pumps, heaters and automation to get started.
                  </p>
                  <button onClick={close} className="mt-6 px-5 py-2.5 rounded-full bg-gradient-ocean text-white text-sm font-semibold">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-3 p-3 rounded-2xl border border-border">
                      <div className="size-20 shrink-0 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden">
                        <img src={it.img} alt={it.name} className="size-full object-contain p-2 mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{it.brand}</div>
                        <div className="font-semibold text-sm leading-snug line-clamp-2">{it.name}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center bg-muted/60 rounded-full p-0.5 border border-border/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(it.id, it.qty - 1)}
                              className="size-7 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums select-none">
                              {it.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setQty(it.id, it.qty + 1)}
                              className="size-7 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <div className="font-bold tracking-tight">{formatUSD(it.price * it.qty)}</div>
                        </div>
                      </div>
                      <button aria-label="Remove" onClick={() => remove(it.id)} className="size-8 self-start grid place-items-center text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border px-6 py-5 space-y-3 bg-surface">
                <Row label="Subtotal" value={formatUSD(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatUSD(shipping)} muted />
                <Row label={`Estimated tax (${(0.0875 * 100).toFixed(2)}%)`} value={formatUSD(tax)} muted />
                <div className="h-px bg-border my-1" />
                <Row label="Total" value={formatUSD(total)} bold />
                <Link
                  to="/checkout"
                  onClick={close}
                  className="mt-2 block text-center py-4 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                >
                  Checkout · {formatUSD(total)}
                </Link>
                <button onClick={close} className="w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition">
                  Continue shopping
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${muted ? "text-muted-foreground" : ""} ${bold ? "text-base font-bold text-foreground" : ""}`}>
      <span>{label}</span>
      <span className={bold ? "tracking-tight" : ""}>{value}</span>
    </div>
  );
}
