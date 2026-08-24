import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useProductsQuery } from "@/lib/products";
import { Loader2, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

export function BestSellers() {
  const { data: products = [], isLoading } = useProductsQuery();

  // Curate top best sellers across Cleaners, Pumps, Heaters, Lights, and Filters (5 per row x 2 rows = 10 items)
  const bestSellers = useMemo(() => {
    if (!products || products.length === 0) return [];

    const categories = ["Pumps", "Cleaners", "Heaters", "Lights", "Filters"];
    const row1: typeof products = [];
    const row2: typeof products = [];

    categories.forEach(cat => {
      const matching = products.filter(p => {
        const pCat = (p.category || "").toLowerCase();
        const isTarget = pCat === cat.toLowerCase() || pCat.includes(cat.toLowerCase());
        const hasImg = p.img && typeof p.img === "string" && (p.img.startsWith("http") || p.img.startsWith("/")) && !p.img.includes("commingsoon");
        return isTarget && hasImg;
      });

      matching.sort((a, b) => {
        const topBrands = ["pentair", "hayward", "jandy", "polaris", "fluidra", "maytronics", "raypak"];
        const aTop = topBrands.includes((a.brand || "").toLowerCase());
        const bTop = topBrands.includes((b.brand || "").toLowerCase());
        if (aTop && !bTop) return -1;
        if (!aTop && bTop) return 1;
        return (b.rating || 5) - (a.rating || 5);
      });

      if (matching[0]) row1.push(matching[0]);
      if (matching[1]) row2.push(matching[1]);
    });

    const combined = [...row1, ...row2];

    // Ensure we always have 10 products
    if (combined.length < 10) {
      const existingIds = new Set(combined.map(p => p.id));
      const remaining = products.filter(p => !existingIds.has(p.id) && p.img && !p.img.includes("commingsoon"));
      remaining.sort((a, b) => (b.rating || 5) - (a.rating || 5));
      combined.push(...remaining.slice(0, 10 - combined.length));
    }

    return combined.slice(0, 10);
  }, [products]);

  if (isLoading) {
    return (
      <section className="py-[60px] bg-surface flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="py-[60px] bg-surface border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">
              Curated Pro Favorites
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight">
              Best Sellers <span className="text-gradient">This Season.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Commercial-grade pool cleaners, variable-speed pumps, high-efficiency heaters, LED lighting & filtration systems.
            </p>
          </div>

          <Link
            to="/shop/$category"
            params={{ category: "all" }}
            search={{ q: "" }}
            className="group hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:text-primary hover:border-primary/40 hover:shadow-md transition-all shadow-2xs"
          >
            Explore All Catalog <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5 Cards per Row on Large Screens, 2 Rows = 10 Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4.5">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
