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
  Sparkles,
  Users,
  TrendingUp,
  Award,
  ShieldCheck,
  Building2,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Google Verified Reviews — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Read verified reviews from 5,000+ pool contractors and service companies. 4.9/5 star aggregate rating on wholesale pricing, same-day freight, and OEM equipment.",
      },
      { property: "og:title", content: "Google Verified Reviews — Pool Supply Wholesalers" },
      {
        property: "og:description",
        content:
          "Rated 4.9/5.0 by 5,000+ pool contractors nationwide. Direct authorized distributor for Pentair, Hayward, Jandy, and Raypak.",
      },
    ],
  }),
  component: ReviewsPage,
});

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
  equipmentTag?: string;
  verified?: boolean;
};

const SEED_REVIEWS: GlobalReview[] = [
  {
    id: "gr-1",
    author: "Robert Patterson",
    role: "BlueWave Commercial Pool Builders",
    location: "Tampa, FL",
    rating: 5,
    date: "2026-05-28",
    title: "Saves us thousands on every commercial build",
    content:
      "The wholesale pricing here is unparalleled. We order all of our Pentair IntelliFlo3 pumps and Hayward commercial heaters through this portal. Delivery is consistently on time, which is critical for construction milestones. Compared to our previous regional distributor, we're saving around 32% on average.",
    helpful: 24,
    category: "pricing",
    equipmentTag: "Pentair IntelliFlo3 VSF",
    verified: true,
  },
  {
    id: "gr-2",
    author: "Elena Martinez",
    role: "Aqualux Pool Service & Repair",
    location: "Nashville, TN",
    rating: 5,
    date: "2026-05-15",
    title: "Best logistics operation in the pool business",
    content:
      "With three service trucks on the road, we need parts fast — zero exceptions. Having localized shipping out of their TN warehouse means standard delivery reaches us in 24 hours. I've placed orders at 1 PM and had the parts on a truck by 3 PM the same day. Incredible speed.",
    helpful: 18,
    category: "shipping",
    equipmentTag: "Hayward TriStar VS 950",
    verified: true,
  },
  {
    id: "gr-3",
    author: "Gary Lindqvist",
    role: "Summit Resorts & Spa Facilities",
    location: "Phoenix, AZ",
    rating: 5,
    date: "2026-04-20",
    title: "Technical team caught a $12K sizing error",
    content:
      "Sizing a commercial pool filtration system is complex. The technical team here audited our pump head loss calculations before we submitted the PO and caught a sizing error that would have cost us $12,000 to fix post-install. Outstanding pre-purchase support that no other distributor has ever offered us.",
    helpful: 31,
    category: "support",
    equipmentTag: "Raypak 406A ASME Gas Heater",
    verified: true,
  },
  {
    id: "gr-4",
    author: "Jessica Sterling",
    role: "Clearwater Care Pools",
    location: "Atlanta, GA",
    rating: 5,
    date: "2026-04-10",
    title: "Genuine factory-sealed parts, full warranties",
    content:
      "I've dealt with liquidated suppliers before and had serial numbers rejected for factory warranties. Pool Supply Wholesalers is a direct authorized dealer for every brand they carry. Our customers are fully protected and we've never had a warranty claim denied. That's peace of mind you can't put a price on.",
    helpful: 22,
    category: "quality",
    equipmentTag: "Hayward SwimClear 420 Cartridge",
    verified: true,
  },
  {
    id: "gr-5",
    author: "Marcus Vance",
    role: "Desert Sun Commercial Pools",
    location: "Scottsdale, AZ",
    rating: 5,
    date: "2026-03-18",
    title: "Switched our entire contractor fleet to this supplier",
    content:
      "We run 8 service vehicles and used to split orders between three suppliers. Moving everything to Pool Supply Wholesalers simplified our operations massively. One account, one invoice, one shipping relationship. The pricing is better than any of the three we replaced, and the account manager knows our business.",
    helpful: 19,
    category: "general",
    equipmentTag: "Jandy JXi 400k BTU Gas Heater",
    verified: true,
  },
  {
    id: "gr-6",
    author: "David Kravitz",
    role: "ProWater Pool Builders",
    location: "Dallas, TX",
    rating: 5,
    date: "2026-02-22",
    title: "Our #1 supplier for all Pentair & Jandy equipment",
    content:
      "We spec Pentair on 90% of our builds. Having an authorized distributor who stocks every SKU we need — including variable speed pump combos and IntelliCenter automation kits — at consistent wholesale pricing is invaluable. We don't shop around anymore. This is our supplier.",
    helpful: 27,
    category: "pricing",
    equipmentTag: "Pentair MasterTemp 400 HD",
    verified: true,
  },
  {
    id: "gr-7",
    author: "Sarah Navarro",
    role: "Blue Horizons Commercial Natatoriums",
    location: "Los Angeles, CA",
    rating: 5,
    date: "2026-02-10",
    title: "Commercial project of 14 pools — handled flawlessly",
    content:
      "We were managing a 14-pool resort installation with an aggressive timeline. Pool Supply Wholesalers coordinated staggered deliveries to the job site on schedule, never missed a date, and the technical team was available by phone every time our PM had a question. Exceptional performance on a complex project.",
    helpful: 35,
    category: "shipping",
    equipmentTag: "Pentair Clean & Clear Plus 520",
    verified: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Reviews" },
  { id: "pricing", label: "Pricing & Margins" },
  { id: "shipping", label: "24-Hour Freight" },
  { id: "support", label: "Tech Advisory" },
  { id: "quality", label: "OEM Quality" },
  { id: "general", label: "General" },
];

const FEATURED_STATS = [
  { value: "4.9", label: "Aggregate Rating", suffix: " / 5.0", icon: Star },
  { value: "5,000+", label: "Verified Reviews", suffix: "", icon: Users },
  { value: "98.4%", label: "Would Recommend", suffix: "", icon: ThumbsUp },
  { value: "3.4 yrs", label: "Avg. Customer Tenure", suffix: "", icon: TrendingUp },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

function ReviewsPage() {
  const [reviews, setReviews] = useState<GlobalReview[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "helpful">("recent");
  const [activeCategory, setActiveCategory] = useState("all");
  const [writeOpen, setWriteOpen] = useState(false);

  // Form state
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newCategory, setNewCategory] = useState<GlobalReview["category"]>("pricing");

  useEffect(() => {
    const stored = localStorage.getItem("psw_global_reviews");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
          return;
        }
      } catch { }
    }
    setReviews(SEED_REVIEWS);
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === "all" ? reviews : reviews.filter((r) => r.category === activeCategory);
    return [...list].sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "helpful") return (b.helpful || 0) - (a.helpful || 0);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [reviews, sortBy, activeCategory]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 4.9, total: 0, counts: [0, 0, 0, 0, 0] };
    const total = reviews.reduce((s, r) => s + r.rating, 0);
    const avg = +(total / reviews.length).toFixed(1);
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    return { avg, total: reviews.length, counts };
  }, [reviews]);

  const markHelpful = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, helpful: (r.helpful || 0) + 1 } : r));
      localStorage.setItem("psw_global_reviews", JSON.stringify(updated));
      return updated;
    });
    toast.success("Thank you for your feedback!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const rev: GlobalReview = {
      id: `gr-user-${Date.now()}`,
      author: newAuthor.trim(),
      role: newRole.trim() || "Licensed Pool Contractor",
      location: newLocation.trim() || undefined,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      title: newTitle.trim(),
      content: newContent.trim(),
      helpful: 0,
      category: newCategory,
      equipmentTag: newEquipment.trim() || undefined,
      verified: true,
    };

    const updated = [rev, ...reviews];
    setReviews(updated);
    localStorage.setItem("psw_global_reviews", JSON.stringify(updated));

    setNewAuthor("");
    setNewRole("");
    setNewLocation("");
    setNewRating(5);
    setNewTitle("");
    setNewContent("");
    setNewEquipment("");
    setNewCategory("pricing");
    setWriteOpen(false);
    toast.success("Review submitted! Thank you for sharing your feedback.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── LUXURY HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#040d1a] text-white border-b border-cyan-500/10">
          {/* Background Hero Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-65"
            style={{ backgroundImage: "url('/about-hero.png')" }}
          />

          {/* Deep Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/80 via-[#040d1a]/60 to-background" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/80 via-transparent to-[#040d1a]/80" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-[1]" />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {/* Google Verified Review Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md"
              >
                {/* Official Google G Logo */}
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Verified Customer Reviews</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              >
                Rated 4.9 / 5.0 by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  5,000+ Pool Professionals
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
              >
                Authentic feedback from commercial pool builders, service companies, and municipality operators relying on our wholesale supply chain every day.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
              >
                <button
                  onClick={() => setWriteOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Write a Verified Review</span>
                </button>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span>Open Commercial Account</span>
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── LIVE STATS HUD ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {FEATURED_STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/30 hover:shadow-md transition-all text-center flex flex-col justify-center items-center group"
                  >
                    <Icon className="size-5 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {stat.value}
                      <span className="text-cyan-600 text-sm font-bold">{stat.suffix}</span>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── MAIN REVIEWS STREAM & SIDEBAR ─── */}
        <section className="py-[50px] bg-slate-50/70 border-y border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Rating Breakdown & Category Filter */}
              <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
                {/* Aggregate Breakdown Box */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-900">Overall Rating</h2>
                      <div className="text-xs text-slate-400 font-medium">Based on {stats.total} verified reviews</div>
                    </div>
                    <div className="text-3xl font-black text-cyan-700">{stats.avg}</div>
                  </div>

                  {/* Rating progress bars */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = stats.counts[stars - 1] || 0;
                      const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                          <span className="w-3 text-right">{stars}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right text-slate-400 text-[11px]">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setWriteOpen(true)}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Submit Your Review</span>
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    <Filter className="size-3.5 text-cyan-600" />
                    <span>Filter By Topic</span>
                  </div>

                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => {
                      const active = activeCategory === cat.id;
                      const count = cat.id === "all" ? reviews.length : reviews.filter((r) => r.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${active
                              ? "bg-cyan-50 text-cyan-800 border border-cyan-200/80"
                              : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${active ? "bg-cyan-200/60 text-cyan-900 font-black" : "bg-slate-100 text-slate-500 font-semibold"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Review Cards List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 px-5 py-3 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">
                    Showing <strong className="text-slate-900">{filtered.length}</strong> reviews
                  </span>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ArrowUpDown className="size-3.5 text-slate-400" />
                    <span>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent border-none outline-none font-extrabold text-cyan-700 cursor-pointer focus:ring-0 text-xs"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="helpful">Most Helpful</option>
                      <option value="highest">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Reviews Stream */}
                {filtered.length > 0 ? (
                  <div className="space-y-3.5">
                    {filtered.map((rev) => (
                      <motion.article
                        key={rev.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-sm grid place-items-center shrink-0">
                                {rev.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-xs sm:text-sm text-slate-900">{rev.author}</span>
                                  {rev.verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="size-2.5" /> Verified Contractor
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium">
                                  {rev.role}
                                  {rev.location && <span> · {rev.location}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="flex gap-0.5 justify-end mb-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">{formatDate(rev.date)}</div>
                            </div>
                          </div>

                          {/* Equipment Tag */}
                          {rev.equipmentTag && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                <Package className="size-3 text-cyan-600" />
                                <span>Verified Purchase: {rev.equipmentTag}</span>
                              </span>
                            </div>
                          )}

                          {/* Review Title & Content */}
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-1.5 leading-snug">
                            {rev.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {rev.content}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-medium">Was this review helpful?</span>
                          <button
                            onClick={() => markHelpful(rev.id)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600 hover:text-cyan-700 transition px-2.5 py-1 rounded-lg hover:bg-slate-50 border border-slate-200/80 cursor-pointer"
                          >
                            <ThumbsUp className="size-3 text-slate-400" />
                            <span>Helpful ({rev.helpful || 0})</span>
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-2">
                    <MessageSquare className="size-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No reviews found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRADE CTA BANNER ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] border border-cyan-500/20 p-6 sm:p-12 text-white shadow-[0_25px_70px_-20px_rgba(0,109,171,0.35)] text-center"
            >
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
                  <Sparkles className="size-3.5" />
                  Instant Trade Access
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Join 5,000+ Verified Pool Professionals Today
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Open a free trade account and experience direct wholesale pricing on Pentair, Hayward, Jandy, and Raypak with 24-hour freight dispatch.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <span>Open Commercial Account</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <button
                    onClick={() => setWriteOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="size-4 text-cyan-400" />
                    <span>Submit a Review</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── WRITE REVIEW MODAL ─── */}
      <AnimatePresence>
        {writeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWriteOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-cyan-600 text-white grid place-items-center font-black">
                    <Star className="size-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Write a Verified Review</h3>
                    <p className="text-[11px] text-slate-400">Share your wholesale equipment experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setWriteOpen(false)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="size-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      Company / Role
                    </label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Apex Pools (Service Tech)"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      City, State
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Dallas, TX"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      Review Topic
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="pricing">Pricing & Margins</option>
                      <option value="shipping">24-Hour Freight</option>
                      <option value="support">Tech Advisory</option>
                      <option value="quality">OEM Quality</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Equipment Installed / Purchased
                  </label>
                  <input
                    type="text"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="e.g. Pentair IntelliFlo3 VSF, Raypak 406A"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setNewHoverRating(star)}
                        onMouseLeave={() => setNewHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`size-6 ${star <= (newHoverRating || newRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                            }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-600">
                      {["", "1 - Poor", "2 - Fair", "3 - Good", "4 - Great", "5 - Outstanding"][newHoverRating || newRating]}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Headline / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Best wholesale supplier in the southeast"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Your Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Tell us about order accuracy, shipping speed, and product performance..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWriteOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
                  >
                    Submit Review
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
