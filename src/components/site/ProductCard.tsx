import { Star, ShoppingBag, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart, formatUSD } from "./cart-context";
import { Product, getProductImage } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product: p, index = 0 }: ProductCardProps) {
  const { add } = useCart();
  const savings = p.msrp && p.msrp > p.price ? p.msrp - p.price : 0;
  const savingsPercent = p.msrp && p.msrp > p.price ? Math.round((savings / p.msrp) * 100) : 0;

  return (
    <article
      className="group relative bg-white rounded-[1.25rem] sm:rounded-[1.4rem] p-2.5 sm:p-3.5 border border-slate-200/80 hover:border-cyan-500/40 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-8px_rgba(0,137,201,0.16)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between h-full"
    >
      <div>
        <Link to="/products/$productId" params={{ productId: p.id }} className="block">
          {/* Backdrop Showcase Image Container */}
          <div className="relative aspect-square w-full rounded-[1rem] sm:rounded-[1.15rem] bg-gradient-to-b from-[#f8fafc] via-[#f1f7fa] to-[#e8f3f7] overflow-hidden grid place-items-center mb-2.5 border border-slate-100">
            {/* Subtle Light Reflection sweep on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <img
              src={getProductImage(p.img)}
              alt={p.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-[82%] object-contain p-1 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-xs"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith('/assets/commingsoon.png')) {
                  e.currentTarget.src = "/assets/commingsoon.png";
                }
              }}
            />

            {/* Top Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              {p.category ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 bg-white/95 backdrop-blur-md rounded-full shadow-2xs border border-white/80">
                  <span className="size-1 rounded-full bg-cyan-500" />
                  {p.category}
                </span>
              ) : <div />}

              {savingsPercent > 5 && (
                <span className="px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-black uppercase tracking-tight text-emerald-700 bg-emerald-50/95 backdrop-blur-md border border-emerald-200/80 rounded-full shadow-2xs">
                  Save {savingsPercent}%
                </span>
              )}
            </div>

            {/* Quick View Floating Action */}
            <span aria-label="Quick view" className="absolute bottom-2 right-2 size-7 sm:size-8 grid place-items-center rounded-full bg-white/90 backdrop-blur text-slate-700 hover:text-cyan-600 hover:bg-white transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90">
              <Eye className="size-3.5 sm:size-4" />
            </span>
          </div>

          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[10px] sm:text-[10.5px] uppercase tracking-wider text-cyan-800/90 font-extrabold truncate max-w-[65%]">
              {p.brand || "Commercial"}
            </span>

            <div className="inline-flex items-center gap-1 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-200/40 shrink-0">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-[10.5px] font-bold text-amber-900 leading-none">
                {(p.rating || 5).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug min-h-[2.2rem] sm:min-h-[2.4rem] group-hover:text-cyan-700 transition-colors line-clamp-2 capitalize">
            {p.name}
          </h3>
        </Link>
      </div>

      {/* Pricing & Cart Action Row */}
      <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between gap-1">
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
              {formatUSD(p.price)}
            </span>
            {p.msrp && p.msrp > p.price && (
              <span className="text-[10.5px] text-slate-400 line-through font-medium">
                {formatUSD(p.msrp)}
              </span>
            )}
          </div>
          <span className="text-[8.5px] uppercase font-extrabold text-emerald-600 tracking-wider block">
            Direct Trade Price
          </span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            add(p, 1);
          }}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 active:scale-95 text-white text-[10.5px] sm:text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-cyan-500/20 cursor-pointer shrink-0"
        >
          <ShoppingBag className="size-3 sm:size-3.5" />
          <span>Add</span>
        </button>
      </div>
    </article>
  );
}
