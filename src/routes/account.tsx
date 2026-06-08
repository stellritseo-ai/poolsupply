import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Clock, LogOut, ChevronRight, ShoppingBag } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/components/site/auth-context";
import { getCustomerOrders } from "@/lib/api/customers.functions";
import { formatUSD } from "@/components/site/cart-context";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Pool Supply Wholesalers" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Protected Route logic in component since context isn't available in Route beforeLoad
  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const res = await getCustomerOrders({ data: { identifier: user.email || user.phone || "" } });
        if (res.success) setOrders(res.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Sidebar Profile */}
            <aside className="w-full md:w-72 shrink-0 space-y-6">
              <div className="rounded-3xl border border-border bg-white p-4 sm:p-6 shadow-[var(--shadow-soft)] text-center">
                <div className="mx-auto size-20 sm:size-24 rounded-full bg-gradient-ocean p-1 mb-4 shadow-lg">
                  <div className="size-full bg-white rounded-full grid place-items-center">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-ocean">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{user.email}</p>
                
                <button 
                  onClick={() => { logout(); window.location.href = "/"; }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-muted hover:text-slate-900 transition-colors"
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-2 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold whitespace-nowrap">
                  <Package className="size-4" /> My Orders
                </Link>
              </nav>
            </aside>

            {/* Orders Section */}
            <div className="flex-1 min-w-0 space-y-6 w-full">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Package className="size-6 text-primary" /> My Orders
              </h2>

              {loading ? (
                <div className="grid place-items-center h-64 rounded-3xl border border-border border-dashed bg-white/50">
                  <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-[var(--shadow-soft)]">
                  <div className="mx-auto size-16 rounded-full bg-accent text-primary grid place-items-center mb-4">
                    <ShoppingBag className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold">No orders yet</h3>
                  <p className="text-muted-foreground mt-2 mb-6">When you place an order, it will appear here.</p>
                  <Link to="/" className="inline-flex px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-border bg-white overflow-hidden shadow-[var(--shadow-soft)] group"
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-5 border-b border-border">
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Order Placed</p>
                            <p className="text-xs sm:text-sm font-semibold mt-0.5">{new Date(order.placedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total</p>
                            <p className="text-xs sm:text-sm font-semibold mt-0.5">{formatUSD(order.total)}</p>
                          </div>
                          <div className="w-full sm:w-auto">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Order #</p>
                            <p className="text-sm font-semibold mt-0.5">{order.id}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-5">
                        <ul className="divide-y divide-border">
                          {order.items.map((it: any) => {
                            const fallbackImg = products.find(p => p.id === it.id)?.img;
                            const imgSrc = it.img || fallbackImg || "https://placehold.co/150x150/png?text=Image+N/A";
                            return (
                            <li key={it.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                              <Link to="/products/$productId" params={{ productId: it.id }} className="size-16 shrink-0 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden">
                                <img src={imgSrc} alt={it.name} className="size-full object-contain p-2 mix-blend-multiply hover:scale-105 transition-transform" />
                              </Link>
                              <div className="flex-1 min-w-0 py-1">
                                <Link to="/products/$productId" params={{ productId: it.id }} className="text-sm font-semibold leading-snug hover:text-primary transition-colors block line-clamp-2">
                                  {it.name}
                                </Link>
                                <div className="text-xs text-muted-foreground mt-1">Qty: {it.qty}</div>
                              </div>
                            </li>
                            );
                          })}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
