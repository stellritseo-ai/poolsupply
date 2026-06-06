import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star, MessageSquare, ArrowUpDown, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — Pool Supply Wholesalers" },
      { name: "description", content: "Read verified reviews from pool builders, technicians, and service providers about our wholesale pool supplies, shipping speeds, and hydraulic advising." }
    ],
  }),
  component: ReviewsPage,
});

type GlobalReview = {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  title: string;
  content: string;
};

const SEED_REVIEWS: GlobalReview[] = [
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
  },
  {
    id: "gr-3",
    author: "Gary L., General Contractor",
    role: "Summit Resorts & Spa",
    rating: 4,
    date: "2026-04-20",
    title: "Solid support & hydraulic sizing",
    content: "Sizing a commercial pool filtration system is complex. The technical team here audited our pump head loss calculations and caught a sizing error that saved us a major headache. Outstanding support."
  },
  {
    id: "gr-4",
    author: "Jessica S., Service Manager",
    role: "Clearwater Care",
    rating: 5,
    date: "2026-04-10",
    title: "Genuine parts with full warranties",
    content: "I've dealt with liquidated suppliers before and had serial numbers rejected for factory warranties. Pool Supply Wholesalers is a direct authorized dealer, which keeps our customers fully protected."
  }
];

function ReviewsPage() {
  const [reviews, setReviews] = useState<GlobalReview[]>([]);
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "recent">("recent");
  
  // Review Form State
  const [writeOpen, setWriteOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const key = "aquapro_global_reviews";
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse global reviews", e);
      }
    }
    setReviews(SEED_REVIEWS);
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // recent
    });
  }, [reviews, sortBy]);

  // Overall Score Stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 4.8, total: 4 };
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = +(totalRating / reviews.length).toFixed(1);
    
    // rating percentages
    const counts = [0, 0, 0, 0, 0]; // 1 to 5 stars
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    const percentages = counts.map(c => Math.round((c / reviews.length) * 100));

    return { avg, total: reviews.length, percentages };
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const newRev: GlobalReview = {
      id: `gr-user-${Date.now()}`,
      author: newAuthor,
      role: newRole.trim() || "Independent Contractor",
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      content: newContent
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem("aquapro_global_reviews", JSON.stringify(updated));

    // Clear form
    setNewAuthor("");
    setNewRole("");
    setNewRating(5);
    setNewTitle("");
    setNewContent("");
    setWriteOpen(false);
    setSuccessMsg("Review submitted successfully! Thank you for backing us.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-16 mb-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Verified Feedback</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight leading-none">Wholesaler Trust Reviews</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              See what professional pool builders, service trucks operators, and developers say about our prices, hydraulic support, and delivery times.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
            {/* Left: Overall score dashboard */}
            <div className="rounded-3xl bg-surface border border-border p-8 space-y-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-extrabold tracking-tight">Dealer Satisfaction</h2>
              
              <div className="flex items-center gap-3">
                <div className="text-5xl font-black text-foreground">{stats.avg}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`size-4 ${i < Math.round(stats.avg) ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`} 
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold">Based on {stats.total} Reviews</div>
                </div>
              </div>

              {/* Distribution bars */}
              {stats.percentages && (
                <div className="space-y-2.5 pt-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stats.percentages![stars - 1] || 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-semibold">
                        <span className="w-3 text-right text-muted-foreground">{stars}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-ocean" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground/85">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setWriteOpen(!writeOpen)}
                className="w-full py-3 rounded-full bg-gradient-ocean text-white font-semibold text-xs shadow-[var(--shadow-soft)] hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-97"
              >
                <Plus className="size-4" /> Write Wholesaler Review
              </button>
            </div>

            {/* Right: Review List */}
            <div className="space-y-6">
              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-semibold">
                  {successMsg}
                </div>
              )}

              {/* Add feedback Form */}
              {writeOpen && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={handleSubmit}
                  className="p-6 rounded-3xl bg-surface border border-border/80 space-y-4"
                >
                  <h3 className="font-bold text-base text-foreground">Submit Wholesaler Feedback</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Your Name</span>
                      <input
                        type="text"
                        required
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="e.g. Marcus T."
                        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Business / Role</span>
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. Apex Pools (Builder)"
                        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                      />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Rating Score</span>
                      <div className="flex items-center gap-1.5 h-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="size-7 grid place-items-center hover:scale-115 transition"
                          >
                            <Star 
                              className={`size-6 ${star <= newRating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Review Title</span>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Summary of wholesale experience"
                        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Detailed Review Details</span>
                    <textarea
                      required
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Comment on shipping speeds, pricing, support, or order accuracy..."
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
                      Submit Feedback
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-xs font-semibold text-muted-foreground">Showing {sortedReviews.length} reviews</span>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" /> Sort By:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer focus:ring-0"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* List */}
              {sortedReviews.length > 0 ? (
                <div className="divide-y divide-border/60 space-y-6">
                  {sortedReviews.map((rev) => (
                    <motion.div 
                      key={rev.id} 
                      layout
                      className="pt-6 first:pt-0 space-y-2"
                    >
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
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">{rev.role}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-foreground">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rev.content}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border p-6">
                  <MessageSquare className="size-8 text-muted-foreground/45 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">No testimonials yet</p>
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
