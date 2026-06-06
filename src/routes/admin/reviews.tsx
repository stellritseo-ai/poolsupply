import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { products as initialProducts, getProductsList, syncLocalProducts, Product, Review } from "@/lib/products";
import { 
  Star, 
  Search, 
  Trash2, 
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsModerator,
});

type CompliedReview = {
  id: string;
  productId: string; // "global" or product.id
  targetName: string; // "Global Storefront" or product.name
  author: string;
  role?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
};

function ReviewsModerator() {
  const [compiledList, setCompiledList] = useState<CompliedReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [toast, setToast] = useState("");

  // Load reviews on mount
  useEffect(() => {
    // 1. Load products reviews
    let dbProducts = initialProducts;
    const dbProductsRaw = localStorage.getItem("aquapro_db_products");
    if (dbProductsRaw) {
      try {
        const parsed = JSON.parse(dbProductsRaw);
        if (Array.isArray(parsed)) {
          dbProducts = parsed;
        }
      } catch (e) {
        console.error("Failed to parse products database for reviews", e);
      }
    }
    
    let list: CompliedReview[] = [];
    dbProducts.forEach(p => {
      if (p.reviews && p.reviews.length > 0) {
        p.reviews.forEach(r => {
          list.push({
            id: r.id || `r-${Math.random()}`,
            productId: p.id,
            targetName: p.name || "Unknown Product",
            author: r.author || "Anonymous Reviewer",
            role: "Product Buyer",
            rating: typeof r.rating === "number" ? r.rating : 5,
            date: r.date || new Date().toISOString().split("T")[0],
            title: r.title || "No Title",
            content: r.content || ""
          });
        });
      }
    });

    // 2. Load global reviews
    const globalRaw = localStorage.getItem("aquapro_global_reviews");
    if (globalRaw) {
      try {
        const parsed = JSON.parse(globalRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((r: any) => {
            list.push({
              id: r.id || `gr-${Math.random()}`,
              productId: "global",
              targetName: "Global Storefront",
              author: r.author || "Anonymous Reviewer",
              role: r.role || "Trade Client",
              rating: typeof r.rating === "number" ? r.rating : 5,
              date: r.date || new Date().toISOString().split("T")[0],
              title: r.title || "No Title",
              content: r.content || ""
            });
          });
        }
      } catch (e) {
        console.error("Failed to parse global reviews database", e);
      }
    } else {
      // Seed default global reviews
      const SEED_GLOBAL = [
        {
          id: "gr-1",
          author: "Robert P., CEO",
          role: "BlueWave Pool Builders",
          rating: 5,
          date: "2026-05-28",
          title: "Saves us thousands on every build",
          content: "The wholesale pricing here is unparalleled. We order all of our Pentair pumps and Hayward heaters through this portal. Delivery is consistently on time, which is critical for construction milestones."
        },
        {
          id: "gr-2",
          author: "Elena M., Owner",
          role: "Aqualux Pool Service",
          rating: 5,
          date: "2026-05-15",
          title: "Best logistics in the business",
          content: "With three service trucks on the road, we need parts fast. Having localized shipping out of their TN warehouse means standard delivery reaches us in 24 hours. Incredible speed."
        }
      ];
      SEED_GLOBAL.forEach((r: any) => {
        list.push({
          id: r.id,
          productId: "global",
          targetName: "Global Storefront",
          author: r.author,
          role: r.role,
          rating: r.rating,
          date: r.date,
          title: r.title,
          content: r.content
        });
      });
      localStorage.setItem("aquapro_global_reviews", JSON.stringify(SEED_GLOBAL));
    }

    setCompiledList(list);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return compiledList.filter(r => {
      const matchSearch = r.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.targetName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
      return matchSearch && matchRating;
    });
  }, [compiledList, searchTerm, ratingFilter]);

  // Moderate/Delete review
  const deleteReview = (rev: CompliedReview) => {
    // 1. Remove from local compiled state
    const updatedCompiled = compiledList.filter(item => item.id !== rev.id);
    setCompiledList(updatedCompiled);

    // 2. Persist removal to databases
    if (rev.productId === "global") {
      const globalRaw = localStorage.getItem("aquapro_global_reviews");
      if (globalRaw) {
        const parsed = JSON.parse(globalRaw);
        const updated = parsed.filter((r: any) => r.id !== rev.id);
        localStorage.setItem("aquapro_global_reviews", JSON.stringify(updated));
      }
    } else {
      const dbProductsRaw = localStorage.getItem("aquapro_db_products");
      if (dbProductsRaw) {
        const dbProducts: Product[] = JSON.parse(dbProductsRaw);
        const updated = dbProducts.map(p => {
          if (p.id === rev.productId) {
            return {
              ...p,
              reviews: p.reviews.filter(r => r.id !== rev.id)
            };
          }
          return p;
        });
        syncLocalProducts(updated);
      }
    }

    triggerToast(`Review by ${rev.author} has been moderated (removed).`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg text-xs font-bold"
          >
            <CheckCircle className="size-4.5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">Audit customer rating entries, verified buyer comments, and storefront testimonials.</p>
      </div>

      {/* Toolbar */}
      <div className="grid sm:grid-cols-[1fr_200px] gap-4 bg-white border border-slate-200/60 p-4 rounded-[2rem] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reviewer, product name, or content keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 h-11 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
        
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-11 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white cursor-pointer"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-bold">Reviewer</th>
                <th className="p-4 font-bold">Target Page</th>
                <th className="p-4 font-bold text-center">Score</th>
                <th className="p-4 font-bold">Review Details</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{rev.author}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rev.role}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rev.productId === "global" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {rev.targetName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`size-3 ${i < rev.rating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-slate-900">{rev.title}</div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {rev.content}
                      </p>
                    </td>
                    <td className="p-4 text-slate-500">
                      {rev.date}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => deleteReview(rev)}
                          className="size-8 rounded-lg hover:bg-rose-50 text-rose-600 grid place-items-center transition mx-auto"
                          title="Delete/Moderate Review"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                    No testimonials matching rating score or keywords.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
