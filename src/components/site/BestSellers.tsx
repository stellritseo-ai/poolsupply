import { motion } from "framer-motion";
import { Star, ShoppingBag, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "./cart-context";
import { useProductsQuery } from "@/lib/products";
import { Loader2 } from "lucide-react";
import { ProductCard } from "./ProductCard";

export function BestSellers() {
  const { data: products = [], isLoading } = useProductsQuery();
  const bestSellers = products.slice(0, 4);

  if (isLoading) {
    return (
      <section className="py-[60px] bg-surface flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="py-[60px] bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Best Sellers</span>
            <h2 className="mt-3 -mb-[30px] text-3xl md:text-[40px] font-extrabold tracking-tight">Pro Favorites This Season.</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
