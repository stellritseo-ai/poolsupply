import { motion } from "framer-motion";
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group bg-white rounded-[1.5rem] sm:rounded-[2.2rem] p-3 sm:p-5 border border-slate-200/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <Link to="/products/$productId" params={{ productId: p.id }} className="block">
          {/* Light Soft Blue Backdrop Image Container */}
          <div className="relative aspect-square rounded-[1.2rem] sm:rounded-[1.6rem] bg-[#e6f4f8] overflow-hidden grid place-items-center mb-3 sm:mb-4">
            <img
              src={getProductImage(p.img)}
              alt={p.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-[80%] object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith('/assets/commingsoon.png')) {
                  e.currentTarget.src = "/assets/commingsoon.png";
                }
              }}
            />
            <span aria-label="Quick view" className="absolute top-3 right-3 size-9 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-sm">
              <Eye className="size-4 text-slate-700" />
            </span>
          </div>

          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold truncate max-w-[70%]">
              {p.brand}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 shrink-0">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {p.rating || 5}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-[15px] leading-snug min-h-[2.4rem] sm:min-h-[2.6rem] group-hover:text-primary transition-colors line-clamp-2 capitalize">
            {p.name}
          </h3>
        </Link>
      </div>

      {/* Divider & Price / Action Row */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="text-sm sm:text-lg font-extrabold tracking-tight text-[#0089C9] truncate">
          {formatUSD(p.price)}
        </div>
        <button
          onClick={() => add(p, 1)}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer shrink-0"
        >
          <ShoppingBag className="size-3 sm:size-3.5" /> Add
        </button>
      </div>
    </motion.article>
  );
}
