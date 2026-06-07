import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { getProductById, getRelatedProducts, syncLocalProducts, useProducts, Review, Product } from "@/lib/products";
import { addReviewDb } from "@/lib/api/products.functions";
import { useQueryClient } from "@tanstack/react-query";
import {
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Truck,
  Wrench,
  MessageSquare,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/products/$productId")({
  head: ({ params }) => {
    const product = getProductById(params.productId);
    return {
      meta: [
        { title: product ? `${product.name} — Pool Supply Wholesalers` : "Product Details" },
        { name: "description", content: product ? product.description : "View premium pool equipment wholesale details." }
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = useParams({ from: "/products/$productId" });
  const { products: productsList } = useProducts();
  const product = productsList.find(p => p.id === productId);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const reviewsEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Custom reviews logic with localStorage persistence
  const [reviews, setReviews] = useState<Review[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!product) return;
    const key = `aquapro_reviews_${product.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
          setQty(1); // Reset quantity on product change
          setSuccessMsg("");
          setWriteOpen(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse product reviews", e);
      }
    }
    setReviews(product.reviews || []);
    setQty(1); // Reset quantity on product change
    setSuccessMsg("");
    setWriteOpen(false);
  }, [productId, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header alwaysDark />
        <main className="flex-1 grid place-items-center px-6 pt-32 pb-20">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Product Not Found</h1>
            <p className="mt-3 text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold">
              <ArrowLeft className="size-4" /> Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const savings = product.msrp - product.price;
  const savingsPercent = Math.round((savings / product.msrp) * 100);
  const related = getRelatedProducts(product);

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? +(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const review: Review = {
      id: `r-user-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      content: newContent
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(`aquapro_reviews_${product.id}`, JSON.stringify(updated));

    // Also update the global product list in localStorage for immediate sync (optional, but good for local cache)
    const storedProducts = localStorage.getItem("aquapro_db_products");
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        if (Array.isArray(parsedProducts)) {
          const updatedProducts = parsedProducts.map(p => {
            if (p.id === product.id) {
              return {
                ...p,
                reviews: [review, ...(p.reviews || [])]
              };
            }
            return p;
          });
          syncLocalProducts(updatedProducts);
        }
      } catch (err) {
        console.error("Failed to sync new review to global product database", err);
      }
    }

    try {
      await addReviewDb({ data: { productId: product.id, review } });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error("Failed to sync new review to DB:", err);
    }

    // Clear form
    setNewAuthor("");
    setNewRating(5);
    setNewTitle("");
    setNewContent("");
    setWriteOpen(false);
    setSuccessMsg("Review submitted successfully! Thank you for your feedback.");
    setTimeout(() => setSuccessMsg(""), 4000);

  };

  const scrollToReviews = () => {
    setWriteOpen(true);
    setTimeout(() => {
      reviewsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Stock status styling helper
  const getStockBadge = () => {
    if (product.stock > 15) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          In Stock ({product.stock} available)
        </span>
      );
    } else if (product.stock > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 border border-amber-100 text-amber-700">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          Low Stock (Only {product.stock} left)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-50 border border-rose-100 text-rose-700">
          <span className="size-2 rounded-full bg-rose-500" />
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mt-[35px] mb-8 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition">Home</Link>
            <span className="text-muted-foreground/45 font-normal">&gt;</span>
            <span className="text-muted-foreground/50">Shop</span>
            <span className="text-muted-foreground/45 font-normal">&gt;</span>
            <span className="text-muted-foreground/50">{product.category}</span>
            <span className="text-muted-foreground/45 font-normal">&gt;</span>
            <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="relative aspect-square rounded-[2rem] bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] border border-border/70 overflow-hidden flex items-center justify-center p-10 shadow-[var(--shadow-soft)]">
                <img
                  src={product.img || "https://placehold.co/400x400/png?text=Image+N/A"}
                  alt={product.name}
                  className="max-h-[90%] max-w-[90%] object-contain mix-blend-multiply hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400/png?text=Image+N/A"; }}
                />

                {/* Floating stock pill */}
                <div className="absolute top-5 left-5">
                  {getStockBadge()}
                </div>
              </div>

              {/* Wholesaler Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-surface border border-border/40">
                  <Truck className="size-5 text-[oklch(0.50_0.14_232)] mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground">Free Shipping</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">Orders over $500</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-surface border border-border/40">
                  <ShieldCheck className="size-5 text-[oklch(0.50_0.14_232)] mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground">Genuine Brand</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">100% Authorized Dealer</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-surface border border-border/40">
                  <Wrench className="size-5 text-[oklch(0.50_0.14_232)] mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground">Warranty</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">{product.specs["Warranty"] || "Full Warranty"}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[oklch(0.50_0.14_232)] font-bold">{product.brand}</span>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{product.name}</h1>

                {/* Rating & Reviews anchor */}
                <button
                  onClick={scrollToReviews}
                  className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition group"
                >
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.round(avgRating) ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <span className="group-hover:underline">({reviews.length} customer reviews)</span>
                </button>
              </div>

              {/* Pricing card */}
              <div className="p-6 rounded-3xl bg-surface border border-border/50 space-y-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Wholesale Price</div>
                  <div className="text-3xl font-extrabold tracking-tight text-[oklch(0.50_0.14_232)]">{formatUSD(product.price)}</div>
                  <div className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">MSRP {formatUSD(product.msrp)}</div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Sparkles className="size-3" /> Save {formatUSD(savings)} ({savingsPercent}% Off MSRP)
                </div>

                <div className="h-px bg-border/40" />

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">SKU</span>
                    <p className="text-foreground mt-0.5">{product.sku}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Category</span>
                    <p className="text-foreground mt-0.5">{product.category}</p>
                  </div>
                </div>
              </div>

              {/* Purchase interactions */}
              <div className="space-y-4">
                {product.stock > 0 ? (
                  <div className="flex gap-4">
                    {/* Qty Selector */}
                    <div className="flex items-center bg-muted/70 rounded-full p-1 border border-border/55">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="size-10 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-foreground tabular-nums select-none">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="size-10 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => add(product, qty)}
                      className="flex-1 py-4 px-6 rounded-full bg-gradient-ocean text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-0.5 active:scale-99"
                    >
                      <ShoppingBag className="size-4" />
                      Add to Cart · {formatUSD(product.price * qty)}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 px-6 rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2"
                  >
                    Out of Stock
                  </button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  🚚 Free standard delivery on orders over $500. Same day shipping for orders placed before 2 PM.
                </p>
              </div>

              {/* Product Tabs */}
              <div className="border-b border-border/80 flex gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 relative ${activeTab === "description" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                >
                  Description
                  {activeTab === "description" && (
                    <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 relative ${activeTab === "specs" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                >
                  Specifications
                  {activeTab === "specs" && (
                    <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              </div>

              <div className="pt-2 text-sm leading-relaxed text-muted-foreground min-h-[140px]">
                {activeTab === "description" ? (
                  <p>{product.description}</p>
                ) : (
                  <div className="grid gap-2 border border-border/50 rounded-2xl overflow-hidden bg-surface">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[150px_1fr] border-b border-border/30 last:border-b-0 p-3 hover:bg-white transition-colors">
                        <span className="font-bold text-foreground/80">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <section ref={reviewsEndRef} className="mt-20 pt-12 border-t border-border">
            <div className="grid lg:grid-cols-[260px_1fr] gap-10">
              {/* Ratings Summary */}
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Customer Reviews</h2>

                <div className="mt-4 flex items-center gap-3">
                  <div className="text-5xl font-black text-foreground">{avgRating}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < Math.round(avgRating) ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">{reviews.length} Reviews</div>
                  </div>
                </div>

                <button
                  onClick={() => setWriteOpen(!writeOpen)}
                  className="mt-6 w-full py-2.5 rounded-full border border-border hover:border-foreground/20 hover:bg-surface font-semibold text-xs text-foreground transition-all active:scale-97"
                >
                  Write a Review
                </button>
              </div>

              {/* Review List & Form */}
              <div className="space-y-6">
                {successMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-semibold">
                    {successMsg}
                  </div>
                )}

                {/* Review Form */}
                {writeOpen && (
                  <motion.form
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddReview}
                    className="p-6 rounded-3xl bg-surface border border-border/80 space-y-4 overflow-hidden"
                  >
                    <h3 className="font-bold text-base text-foreground">Write a Customer Review</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Your Name</span>
                        <input
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="e.g. John D."
                          className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>

                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Rating</span>
                        <div className="flex items-center gap-1.5 h-10">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="size-7 grid place-items-center hover:scale-110 transition"
                            >
                              <Star
                                className={`size-6 ${star <= newRating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Review Title</span>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Review details</span>
                      <textarea
                        required
                        rows={4}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="What did you like or dislike? How does it perform?"
                        className="w-full p-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition resize-none"
                      />
                    </label>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setWriteOpen(false)}
                        className="px-4 py-2 rounded-full hover:bg-muted font-semibold text-xs text-muted-foreground transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-xs hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition"
                      >
                        Submit Review
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Review Items */}
                {reviews.length > 0 ? (
                  <div className="divide-y divide-border/50 space-y-5">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pt-5 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3 ${i < rev.rating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-foreground">{rev.author}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{rev.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{rev.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rev.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface rounded-3xl border border-dashed border-border p-6">
                    <MessageSquare className="size-8 text-muted-foreground/45 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">No reviews yet</p>
                    <p className="text-xs text-muted-foreground/75 mt-1">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-24 pt-12 border-t border-border">
              <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Recommendations</span>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Related Products</h2>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <article
                    key={p.id}
                    className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all"
                  >
                    <Link to="/products/$productId" params={{ productId: p.id }} className="block">
                      <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center">
                        <img
                          src={p.img || "https://placehold.co/400x400/png?text=Image+N/A"}
                          alt={p.name}
                          loading="lazy"
                          width={300}
                          height={300}
                          className="size-[80%] object-contain p-4 group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                          onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400/png?text=Image+N/A"; }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{p.brand}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                          <Star className="size-3 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                          {p.rating}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-bold text-sm text-foreground leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">{p.name}</h3>
                    </Link>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-black tracking-tight">${p.price.toLocaleString()}</div>
                      <button
                        onClick={() => add(p, 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-[10px] font-semibold hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition"
                      >
                        <ShoppingBag className="size-3" /> Add
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
