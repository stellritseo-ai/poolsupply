import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Star,
  MessageSquare,
  ArrowUpDown,
  Plus,
  X,
  CheckCircle2,
  ThumbsUp,
  Filter,
  ArrowRight,
  Quote,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Read verified reviews from 5,000+ pool builders, technicians, and service professionals about our wholesale pricing, same-day shipping, and expert technical support.",
      },
      { property: "og:title", content: "Dealer Reviews — Pool Supply Wholesalers" },
      {
        property: "og:description",
        content:
          "Verified feedback from pool professionals nationwide. See what builders, service techs, and commercial operators say about our wholesale pool equipment supply.",
      },
    ],
  }),
  component: ReviewsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
type GlobalReview = {
  id: string;
  author: string;
  role: string;
  location?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful?: number;
  category?: "pricing" | "shipping" | "support" | "quality" | "general";
  verified?: boolean;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_REVIEWS: GlobalReview[] = [
  {
    id: "gr-1",
    author: "Robert P.",
    role: "BlueWave Pool Builders",
    location: "Tampa, FL",
    rating: 5,
    date: "2026-05-28",
    title: "Saves us thousands on every build",
    content:
      "The wholesale pricing here is unparalleled. We order all of our Pentair pumps and Hayward heaters through this portal. Delivery is consistently on time, which is critical for construction milestones. Compared to our previous distributor, we're saving around 32% on average. Nothing compares.",
    helpful: 24,
    category: "pricing",
    verified: true,
  },
  {
    id: "gr-2",
    author: "Elena M.",
    role: "Aqualux Pool Service",
    location: "Nashville, TN",
    rating: 5,
    date: "2026-05-15",
    title: "Best logistics operation in the business",
    content:
      "With three service trucks on the road, we need parts fast — zero exceptions. Having localized shipping out of their TN warehouse means standard delivery reaches us in 24 hours. I've placed orders at 1 PM and had the parts on a truck by 3 PM the same day. Incredible speed.",
    helpful: 18,
    category: "shipping",
    verified: true,
  },
  {
    id: "gr-3",
    author: "Gary L.",
    role: "Summit Resorts & Spa",
    location: "Phoenix, AZ",
    rating: 5,
    date: "2026-04-20",
    title: "Technical team caught a $12K sizing error",
    content:
      "Sizing a commercial pool filtration system is complex. The technical team here audited our pump head loss calculations before we submitted the PO and caught a sizing error that would have cost us $12,000 to fix post-install. Outstanding pre-purchase support that no other distributor has ever offered us.",
    helpful: 31,
    category: "support",
    verified: true,
  },
  {
    id: "gr-4",
    author: "Jessica S.",
    role: "Clearwater Care",
    location: "Atlanta, GA",
    rating: 5,
    date: "2026-04-10",
    title: "Genuine parts, full warranties — exactly what we need",
    content:
      "I've dealt with liquidated suppliers before and had serial numbers rejected for factory warranties. Pool Supply Wholesalers is a direct authorized dealer for every brand they carry. Our customers are fully protected and we've never had a warranty claim denied. That's peace of mind you can't put a price on.",
    helpful: 22,
    category: "quality",
    verified: true,
  },
  {
    id: "gr-5",
    author: "Marcus T.",
    role: "Desert Sun Pool Co.",
    location: "Scottsdale, AZ",
    rating: 5,
    date: "2026-03-18",
    title: "Switched our entire fleet to this supplier",
    content:
      "We run 8 service vehicles and used to split orders between three suppliers. Moving everything to Pool Supply Wholesalers simplified our operations massively. One account, one invoice, one shipping relationship. The pricing is better than any of the three we replaced, and the account manager knows our business.",
    helpful: 19,
    category: "general",
    verified: true,
  },
  {
    id: "gr-6",
    author: "Linda C.",
    role: "Crystal Aquatics LLC",
    location: "Orlando, FL",
    rating: 4,
    date: "2026-03-05",
    title: "Rock solid reliability, minor UX tweaks needed",
    content:
      "Pricing and shipping are excellent — we've never had a late shipment in two years. The online portal is functional but could benefit from better bulk order tooling. That said, our account manager handles bulk orders personally and it works out. Minor gripe in an otherwise outstanding wholesale relationship.",
    helpful: 11,
    category: "general",
    verified: true,
  },
  {
    id: "gr-7",
    author: "David K.",
    role: "ProWater Pool Builders",
    location: "Dallas, TX",
    rating: 5,
    date: "2026-02-22",
    title: "Our #1 supplier for all Pentair equipment",
    content:
      "We spec Pentair on 90% of our builds. Having an authorized distributor who stocks every SKU we need — including the variable speed pump combos and EasyTouch automation kits — at consistent wholesale pricing is invaluable. We don't shop around anymore. This is our supplier.",
    helpful: 27,
    category: "pricing",
    verified: true,
  },
  {
    id: "gr-8",
    author: "Sarah N.",
    role: "Blue Horizons Commercial",
    location: "Los Angeles, CA",
    rating: 5,
    date: "2026-02-10",
    title: "Commercial project of 14 pools — handled flawlessly",
    content:
      "We were managing a 14-pool resort installation with an aggressive timeline. Pool Supply Wholesalers coordinated staggered deliveries to the job site on schedule, never missed a date, and the technical team was available by phone every time our PM had a question. Exceptional performance on a complex project.",
    helpful: 35,
    category: "shipping",
    verified: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Reviews" },
  { id: "pricing", label: "Pricing" },
  { id: "shipping", label: "Shipping" },
  { id: "support", label: "Tech Support" },
  { id: "quality", label: "Product Quality" },
  { id: "general", label: "General" },
];

const FEATURED_STATS = [
  { value: "4.9", label: "Average Rating", icon: Star, suffix: "/5" },
  { value: "5,000+", label: "Verified Reviewers", icon: Users, suffix: "" },
  { value: "98%", label: "Would Recommend", icon: ThumbsUp, suffix: "" },
  { value: "3 yrs", label: "Avg. Customer Tenure", icon: TrendingUp, suffix: "" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const categoryColor: Record<string, string> = {
  pricing: "bg-emerald-100 text-emerald-700",
  shipping: "bg-blue-100 text-blue-700",
  support: "bg-violet-100 text-violet-700",
  quality: "bg-amber-100 text-amber-700",
  general: "bg-slate-100 text-slate-600",
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: d, ease: "easeOut" } }),
};

// ─── Component ───────────────────────────────────────────────────────────────
function ReviewsPage() {
  const [reviews, setReviews] = useState<GlobalReview[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");
  const [activeCategory, setActiveCategory] = useState("all");
  const [writeOpen, setWriteOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<GlobalReview["category"]>("general");

  useEffect(() => {
    const stored = localStorage.getItem("psw_global_reviews");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
          return;
        }
      } catch {}
    }
    setReviews(SEED_REVIEWS);
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === "all" ? reviews : reviews.filter((r) => r.category === activeCategory);
    return [...list].sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      if (sortBy === "helpful") return (b.helpful || 0) - (a.helpful || 0);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [reviews, sortBy, activeCategory]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 4.9, total: 0, counts: [0, 0, 0, 0, 0] };
    const total = reviews.reduce((s, r) => s + r.rating, 0);
    const avg = +(total / reviews.length).toFixed(1);
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
    return { avg, total: reviews.length, counts };
  }, [reviews]);

  const markHelpful = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: (r.helpful || 0) + 1 } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const rev: GlobalReview = {
      id: `gr-user-${Date.now()}`,
      author: newAuthor,
      role: newRole.trim() || "Independent Contractor",
      location: newLocation.trim() || undefined,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      content: newContent,
      helpful: 0,
      category: newCategory,
      verified: false,
    };

    const updated = [rev, ...reviews];
    setReviews(updated);
    localStorage.setItem("psw_global_reviews", JSON.stringify(updated));

    setNewAuthor(""); setNewRole(""); setNewLocation(""); setNewRating(5);
    setNewTitle(""); setNewContent(""); setNewCategory("general");
    setWriteOpen(false);
    setSuccessMsg("Thank you! Your review has been submitted.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          className="relative pt-32 pb-20 overflow-hidden"
          style={{ background: "linear-gradient(160deg, #001a3a 0%, #003a7a 55%, #0055aa 100%)" }}
        >
          <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(89,210,243,0.16) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,137,201,0.18) 0%, transparent 70%)", filter: "blur(50px)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
              >
                <Award className="size-3.5 text-cyan-400" />
                Verified Dealer Feedback
              </span>

              <h1
                className="text-white tracking-tight leading-tight mb-5"
                style={{ fontSize: "50px", fontWeight: 800 }}
              >
                Trusted by{" "}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #59D2F3 0%, #00B4D8 50%, #48CAE4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  Pool Professionals
                </span>
              </h1>

              <p className="text-white/65 max-w-xl mx-auto text-base leading-relaxed mb-10">
                Real feedback from pool builders, service technicians, and commercial operators who rely on us daily for wholesale equipment, fast logistics, and expert support.
              </p>

              {/* Aggregate score */}
              <div
                className="inline-flex items-center gap-5 px-7 py-5 rounded-[2rem]"
                style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <div className="text-5xl font-black text-white">{stats.avg}</div>
                <div className="text-left">
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-white/70 text-xs font-semibold">
                    Based on {stats.total}+ verified reviews
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
        </section>

        {/* ─── STATS STRIP ─── */}
        <section className="max-w-7xl mx-auto px-6 -mt-2 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[2rem] overflow-hidden border border-border shadow-[var(--shadow-soft)]">
            {FEATURED_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="bg-white p-6 text-center flex flex-col items-center hover:bg-surface transition-all group"
                >
                  <Icon className="size-5 mb-2 group-hover:scale-110 transition-transform" style={{ color: "oklch(0.50 0.14 232)" }} />
                  <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "oklch(0.50 0.14 232)" }}>
                    {s.value}<span className="text-base">{s.suffix}</span>
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground/80 mt-1 uppercase tracking-wider">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── FEATURED QUOTE ─── */}
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] p-10 relative overflow-hidden text-center"
            style={{ background: "linear-gradient(135deg, #001a3a 0%, #003a7a 100%)" }}
          >
            <div className="absolute top-6 left-8 opacity-20">
              <Quote className="size-16 text-cyan-400" />
            </div>
            <div className="relative z-10">
              <p className="text-white/85 text-lg sm:text-xl leading-relaxed italic font-medium mb-6 max-w-2xl mx-auto">
                "Pool Supply Wholesalers is the rare wholesale partner that actually understands the construction timeline pressure we operate under. They've never missed a delivery date in three years of business with us."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}>
                  DK
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-sm">David K.</div>
                  <div className="text-white/50 text-xs">ProWater Pool Builders — Dallas, TX</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="grid lg:grid-cols-[300px_1fr] gap-10 items-start">
            {/* ── LEFT SIDEBAR ── */}
            <div className="space-y-5 lg:sticky lg:top-28">
              {/* Score card */}
              <div className="rounded-[2rem] bg-white border border-border p-6 shadow-[var(--shadow-soft)] space-y-5">
                <h2 className="font-extrabold text-lg tracking-tight">Overall Rating</h2>

                <div className="flex items-center gap-4">
                  <div
                    className="text-5xl font-black"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  >
                    {stats.avg}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`size-4 ${i <= Math.round(stats.avg) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">
                      {stats.total} verified reviews
                    </div>
                  </div>
                </div>

                {/* Rating bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats.counts[stars - 1] || 0;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-semibold">
                        <span className="w-2 text-right text-muted-foreground">{stars}</span>
                        <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: (5 - stars) * 0.07 }}
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(to right, #0089C9, #59D2F3)" }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground/80">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  id="write-review-btn"
                  onClick={() => setWriteOpen(true)}
                  className="w-full py-3.5 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)", boxShadow: "0 8px 24px rgba(0,137,201,0.3)" }}
                >
                  <Plus className="size-4" /> Write a Review
                </button>
              </div>

              {/* Category filter */}
              <div className="rounded-[2rem] bg-white border border-border p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="size-4" style={{ color: "oklch(0.50 0.14 232)" }} />
                  <h3 className="font-extrabold text-sm">Filter by Category</h3>
                </div>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const count = cat.id === "all" ? reviews.length : reviews.filter((r) => r.category === cat.id).length;
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active ? "text-white" : "text-foreground/75 hover:bg-surface"
                        }`}
                        style={active ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : {}}
                      >
                        {cat.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT: REVIEW LIST ── */}
            <div className="space-y-5">
              {/* Success toast */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sort toolbar */}
              <div className="flex items-center justify-between bg-white rounded-2xl border border-border px-5 py-3 shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground">
                  Showing <strong className="text-foreground">{filtered.length}</strong> review{filtered.length !== 1 ? "s" : ""}
                  {activeCategory !== "all" && (
                    <span> in <strong className="text-foreground">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</strong></span>
                  )}
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer focus:ring-0 text-xs"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* Review Cards */}
              {filtered.length > 0 ? (
                <div className="space-y-4">
                  {filtered.map((rev, i) => (
                    <motion.article
                      key={rev.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.04 }}
                      className="group bg-white rounded-[1.75rem] border border-border p-6 hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="size-11 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md"
                            style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}
                          >
                            {rev.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-foreground">{rev.author}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="size-2.5" /> Verified
                                </span>
                              )}
                              {rev.category && rev.category !== "general" && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${categoryColor[rev.category] || "bg-slate-100 text-slate-600"}`}>
                                  {rev.category}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {rev.role}
                              {rev.location && <span className="ml-1 text-muted-foreground/60">· {rev.location}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {/* Stars */}
                          <div className="flex gap-0.5 justify-end mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`size-3.5 ${i <= rev.rating ? "fill-amber-400 text-amber-400" : "text-border"}`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold">
                            {formatDate(rev.date)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-extrabold text-base text-foreground mb-2 leading-snug">{rev.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rev.content}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          Was this helpful?
                        </span>
                        <button
                          onClick={() => markHelpful(rev.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-full hover:bg-surface border border-transparent hover:border-border"
                        >
                          <ThumbsUp className="size-3.5" />
                          Helpful {rev.helpful ? `(${rev.helpful})` : ""}
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 rounded-[2rem] border border-dashed border-border bg-surface space-y-3">
                  <MessageSquare className="size-10 mx-auto text-muted-foreground/30" />
                  <p className="font-bold text-foreground">No reviews in this category yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to leave a review in this category.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[3rem] overflow-hidden px-8 sm:px-16 py-16 text-center"
            style={{ background: "linear-gradient(135deg, #001f4d 0%, #003a7a 50%, #0055aa 100%)" }}
          >
            <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full pointer-events-none -translate-y-1/2"
              style={{ background: "radial-gradient(circle, rgba(0,180,216,0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none translate-y-1/2"
              style={{ background: "radial-gradient(circle, rgba(89,210,243,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <Sparkles className="size-3.5 text-cyan-400" />
                Join the Community
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                Experience It Yourself
              </h2>
              <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-10">
                Open a free trade account and see firsthand why 5,000+ pool professionals trust us with their wholesale supply chain.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-white text-foreground hover:bg-white/90 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Dealer Account <ArrowRight className="size-4" />
                </Link>
                <button
                  onClick={() => setWriteOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white border border-white/25 hover:bg-white/10 transition-all"
                >
                  <Plus className="size-4" /> Write a Review
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-5 text-white/50 text-xs font-semibold">
                {["No Setup Fees", "Instant Access", "Same-Day Shipping", "Authorized Brands"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-cyan-400" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── WRITE REVIEW MODAL ─── */}
      <AnimatePresence>
        {writeOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWriteOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-full max-w-lg bg-white rounded-[2rem] border border-border shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}>
                    <MessageSquare className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Write a Review</h3>
                    <p className="text-xs text-muted-foreground">Share your wholesale experience</p>
                  </div>
                </div>
                <button onClick={() => setWriteOpen(false)}
                  className="size-8 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition">
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name + Role */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Your Name *</span>
                    <input type="text" required value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. Marcus T."
                      className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition" />
                  </label>
                  <label>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Business / Role</span>
                    <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Apex Pools (Builder)"
                      className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition" />
                  </label>
                </div>

                {/* Location + Category */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Location</span>
                    <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Tampa, FL"
                      className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition" />
                  </label>
                  <label>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Review Category</span>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition cursor-pointer">
                      {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Star Rating */}
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">Your Rating *</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onMouseEnter={() => setNewHoverRating(star)}
                        onMouseLeave={() => setNewHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="transition-transform hover:scale-110 p-0.5">
                        <Star className={`size-7 transition-all ${star <= (newHoverRating || newRating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-muted-foreground">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent"][newHoverRating || newRating]}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <label>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Review Title *</span>
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Summary of your experience"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition" />
                </label>

                {/* Content */}
                <label>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Detailed Review *</span>
                  <textarea required rows={4} value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Tell us about pricing, shipping speed, technical support, or order accuracy..."
                    className="w-full p-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition resize-none" />
                </label>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setWriteOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-muted-foreground hover:bg-surface border border-border transition">
                    Cancel
                  </button>
                  <button type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold shadow-lg hover:opacity-95 transition"
                    style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}>
                    <CheckCircle2 className="size-4" /> Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
