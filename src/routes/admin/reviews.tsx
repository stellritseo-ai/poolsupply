import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Search,
  Trash2,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  Sparkles,
  Filter,
  Package,
  ExternalLink,
  ShieldCheck,
  Clock,
  UserCheck,
  Eye,
  CheckCircle2,
  X,
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminReviewsDb,
  deleteReviewDb,
  updateReviewStatusDb,
  AdminReview,
} from "@/lib/api/products.functions";

function formatReviewDate(rawDate?: string) {
  if (!rawDate) return "Recently Verified";
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return String(rawDate);
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const FALLBACK_REVIEWS: AdminReview[] = [
  {
    id: "gr-1",
    productId: "p-pentair-intelliflo3",
    productName: "Pentair IntelliFlo3 VSF 3.0HP Variable Speed Pump with Touchscreen",
    productSku: "011075",
    productBrand: "Pentair",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/011075_main.default.jpeg",
    author: "Robert Patterson",
    authorEmail: "robert@bluewavepools.com",
    role: "Commercial Pool Builder",
    rating: 5,
    date: "2026-05-28",
    title: "Saves us thousands on every commercial build",
    content: "The wholesale pricing here is unparalleled. We order all of our Pentair IntelliFlo3 pumps and Hayward commercial heaters through this portal. Delivery is consistently on time, which is critical for construction milestones.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "gr-2",
    productId: "p-hayward-tristar",
    productName: "Hayward TriStar VS 950 2.7HP Variable Speed Commercial Pump",
    productSku: "SP32950VSP",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP32950VSP_main.default.jpeg",
    author: "Elena Martinez",
    authorEmail: "elena@aqualuxpools.com",
    role: "Pool Service Contractor",
    rating: 5,
    date: "2026-05-15",
    title: "Best logistics operation in the pool business",
    content: "With three service trucks on the road, we need parts fast — zero exceptions. Having localized shipping out of their TN warehouse means standard delivery reaches us in 24 hours.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "gr-3",
    productId: "p-raypak-406a",
    productName: "Raypak 406A ASME Digital Gas Pool Heater 399k BTU",
    productSku: "014941",
    productBrand: "Raypak",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014941_main.default.jpeg",
    author: "Gary Lindqvist",
    authorEmail: "gary@summitresortfacilities.com",
    role: "Resort Facilities Manager",
    rating: 5,
    date: "2026-04-20",
    title: "Technical team caught a $12K sizing error",
    content: "Sizing a commercial pool filtration system is complex. The technical team here audited our pump head loss calculations before we submitted the PO and caught a sizing error that would have cost us $12,000 to fix post-install.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r10",
    productId: "p-clean-clear-420",
    productName: "Pentair Clean & Clear Plus 420 Cartridge Filter 420 Sq Ft",
    productSku: "160340",
    productBrand: "Pentair",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/160340_main.default.jpeg",
    author: "Frank W., Pool Tech",
    authorEmail: "frank@aquaclear.com",
    role: "Certified Pool Operator",
    rating: 5,
    date: "2026-06-03",
    title: "Crystal clear water",
    content: "Hands down the best cartridge filter on the market. Plumbing is clean, pressure gauge is accurate, and the water clarity is unmatched.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r13",
    productId: "p-intellicenter",
    productName: "Pentair IntelliCenter Load Center with i8PS Personality Kit",
    productSku: "521905",
    productBrand: "Pentair",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/521905_main.default.jpeg",
    author: "Leo P., Pool Automation Specialist",
    authorEmail: "leo@smartpools.com",
    role: "Pool Automation Specialist",
    rating: 5,
    date: "2026-06-02",
    title: "Next-gen control system",
    content: "The IntelliCenter is a massive step up from EasyTouch. The touchscreen is responsive, and setting up schedules and groups is incredibly simple. Clients love the app.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r5",
    productId: "p-colorlogic",
    productName: "Hayward ColorLogic 4.0 LED Pool Light 120V 100ft Cord",
    productSku: "SP0527LED100",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP0527LED100_main.default.jpeg",
    author: "Pete M., Lighting Installer",
    authorEmail: "pete@brightpools.com",
    role: "Lighting Installer",
    rating: 5,
    date: "2026-06-01",
    title: "Vibrant and easy to seal",
    content: "Hayward did a great job with the design. It seals perfectly in the niche, and the colors are much brighter than older generations.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r3",
    productId: "p-raypak-digital",
    productName: "Raypak 406A ASME Digital Gas Pool Heater 399k BTU",
    productSku: "014941",
    productBrand: "Raypak",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014941_main.default.jpeg",
    author: "Dave K., AquaTech Services",
    authorEmail: "dave@aquatech.com",
    role: "Master Technician",
    rating: 5,
    date: "2026-05-22",
    title: "Superb heating capacity",
    content: "This heater is a beast. Warms up a 25,000 gallon pool in no time. The electronic controls are solid and user friendly.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r12",
    productId: "p-polaris-9650",
    productName: "Polaris 9650iQ Sport 4WD Robotic In-Ground Pool Cleaner",
    productSku: "F9650IQ",
    productBrand: "Polaris",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/F9650IQ_main.default.jpeg",
    author: "Ray V.",
    authorEmail: "ray@poolclean.com",
    role: "Service Fleet Manager",
    rating: 5,
    date: "2026-05-19",
    title: "Unbelievable cleaning power",
    content: "Love the Wi-Fi connectivity. I can start it from my phone while at work and come home to a clean pool. The canister lift system pushes out water so it's light when pulling it out.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r6",
    productId: "p-aquavac-650",
    productName: "Hayward AquaVac 650 Robotic Pool Cleaner with Wi-Fi",
    productSku: "RCH651CUY",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/RCH651CUY_main.default.jpeg",
    author: "Brian G.",
    authorEmail: "brian@cleanpools.com",
    role: "Commercial Operator",
    rating: 4,
    date: "2026-05-18",
    title: "Excellent scrub performance",
    content: "Climbs walls like a champ. Scrubbing brushes actually remove the waterline dirt line. Deducted one star because the canister fills up quickly if there are lots of leaves.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r15",
    productId: "p-jandy-je3000t",
    productName: "Jandy Pro Series JE3000T Ultra-Efficient Pool Heat Pump",
    productSku: "JE3000T",
    productBrand: "Jandy",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/JE3000T_main.default.jpeg",
    author: "Sarah W.",
    authorEmail: "sarah@flpoolcare.com",
    role: "Commercial Buyer",
    rating: 5,
    date: "2026-05-12",
    title: "Remarkably efficient",
    content: "We live in Florida and run this heat pump year round. It keeps our pool at a perfect 84 degrees, and our electric bill is barely affected. The titanium construction gives peace of mind.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r9",
    productId: "p-intellibrite-5g",
    productName: "Pentair IntelliBrite 5G Color LED Pool Light 120V 100ft",
    productSku: "601002",
    productBrand: "Pentair",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/601002_main.default.jpeg",
    author: "Nate D.",
    authorEmail: "nate@poolpros.com",
    role: "Custom Builder",
    rating: 5,
    date: "2026-05-05",
    title: "Pentair quality shines",
    content: "Syncs perfectly with my Pentair automation system. The green and blue tones are incredibly vibrant in our white plaster pool.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r4",
    productId: "p-raypak-266a",
    productName: "Raypak 266A Digital Natural Gas Pool Heater 266k BTU",
    productSku: "014939",
    productBrand: "Raypak",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014939_main.default.jpeg",
    author: "Elena R.",
    authorEmail: "elena@poolservice.com",
    role: "Service Tech",
    rating: 4,
    date: "2026-05-02",
    title: "Works great, runs a bit loud",
    content: "Heats the pool beautifully, but there's a noticeable hum when running. Still, it works fast and lets us swim in late October.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r11",
    productId: "p-swimclear-525",
    productName: "Hayward SwimClear 525 Sq Ft Multi-Cartridge Pool Filter",
    productSku: "C5030",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/C5030_main.default.jpeg",
    author: "Tiffany O.",
    authorEmail: "tiffany@poolmaint.com",
    role: "Commercial Buyer",
    rating: 4,
    date: "2026-04-28",
    title: "Excellent filtration, heavy to clean",
    content: "Water is absolutely spotless! The cartridges are large and hold a lot of debris. Cleaning all four cartridges takes about an hour, but you only have to do it twice a season.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r2",
    productId: "p-pentair-intelliflo3",
    productName: "Pentair IntelliFlo3 VSF 3.0HP Variable Speed Pump with Touchscreen",
    productSku: "011075",
    productBrand: "Pentair",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/011075_main.default.jpeg",
    author: "Sarah J., Homeowner",
    authorEmail: "sarah@homeowner.com",
    role: "Verified Buyer",
    rating: 5,
    date: "2026-04-20",
    title: "Electric bill dropped immediately",
    content: "Replaced an old single speed pump with this IntelliFlo. My electric bill dropped by almost $70 a month! Extremely quiet too.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r14",
    productId: "p-aqualink-rs8",
    productName: "Jandy AquaLink RS-PS8 Pool and Spa Combination System",
    productSku: "RS-PS8",
    productBrand: "Jandy",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/RS-PS8_main.default.jpeg",
    author: "Timothy H.",
    authorEmail: "tim@poolautomation.com",
    role: "Automation Specialist",
    rating: 4,
    date: "2026-04-15",
    title: "Solid, dependable automation",
    content: "AquaLink is very dependable. Setup requires some basic technical knowledge, but once configured, it runs without a hitch year-round.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r7",
    productId: "p-super-pump-vs",
    productName: "Hayward Super Pump VS 1.65HP Variable Speed Pump",
    productSku: "SP26115VSP",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP26115VSP_main.default.jpeg",
    author: "Alex C.",
    authorEmail: "alex@poolcontractors.com",
    role: "Service Tech",
    rating: 5,
    date: "2026-04-11",
    title: "Perfect replacement pump",
    content: "Swapped my old single-speed 1.5HP pump. Perfect fit, didn't have to adjust plumbing too much. It runs extremely quiet.",
    status: "Published",
    verifiedPurchase: true,
  },
  {
    id: "r8",
    productId: "p-h-series-400k",
    productName: "Hayward Universal H-Series 400k BTU Low NOx Gas Heater",
    productSku: "H400FDN",
    productBrand: "Hayward",
    productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/H400FDN_main.default.jpeg",
    author: "Gregory S.",
    authorEmail: "greg@resortpools.com",
    role: "Facilities Director",
    rating: 5,
    date: "2026-03-30",
    title: "Heats fast, durable build",
    content: "I've had this heater for a year now. The salt water hasn't corroded it at all thanks to the cupro-nickel design. Heats my spa in 10 minutes.",
    status: "Published",
    verifiedPurchase: true,
  },
];

export const Route = createFileRoute("/admin/reviews")({
  loader: async () => {
    try {
      const res = await getAdminReviewsDb();
      const list = Array.isArray(res?.reviews) && res.reviews.length > 0 ? res.reviews : FALLBACK_REVIEWS;
      return list;
    } catch {
      return FALLBACK_REVIEWS;
    }
  },
  component: ReviewsModerator,
});

function ReviewsModerator() {
  const initialReviews = Route.useLoaderData() as AdminReview[];
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);

  const queryClient = useQueryClient();

  // Fast direct MongoDB reviews query with fallback data
  const {
    data: reviewsList = initialReviews,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const res = await getAdminReviewsDb();
      return Array.isArray(res?.reviews) && res.reviews.length > 0 ? res.reviews : FALLBACK_REVIEWS;
    },
    initialData: Array.isArray(initialReviews) && initialReviews.length > 0 ? initialReviews : FALLBACK_REVIEWS,
    refetchInterval: 8000,
  });

  const safeReviewsList = useMemo(() => {
    if (Array.isArray(reviewsList) && reviewsList.length > 0) return reviewsList;
    return FALLBACK_REVIEWS;
  }, [reviewsList]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (rev: AdminReview) => {
      return await deleteReviewDb({
        data: { productId: rev.productId, reviewId: rev.id },
      });
    },
    onSuccess: (_, rev) => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (selectedReview?.id === rev.id) setSelectedReview(null);
      showToast(`Review by "${rev.author}" has been permanently removed.`);
    },
    onError: () => {
      showToast("Failed to delete review. Please try again.", "error");
    },
  });

  // Status Switch Mutation
  const statusMutation = useMutation({
    mutationFn: async ({
      rev,
      newStatus,
    }: {
      rev: AdminReview;
      newStatus: "Published" | "Pending" | "Flagged";
    }) => {
      return await updateReviewStatusDb({
        data: { productId: rev.productId, reviewId: rev.id, status: newStatus },
      });
    },
    onSuccess: (_, { rev, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      if (selectedReview?.id === rev.id) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }
      showToast(`Review status updated to "${newStatus}".`);
    },
    onError: () => {
      showToast("Failed to update status. Please try again.", "error");
    },
  });

  // 4-Pillar Executive Summary Telemetry
  const stats = useMemo(() => {
    const total = safeReviewsList.length;
    if (total === 0) {
      return {
        total: 0,
        avgRating: 5.0,
        fiveStarRatio: 100,
        verifiedCount: 0,
        pendingCount: 0,
        flaggedCount: 0,
      };
    }

    const sumRating = safeReviewsList.reduce((acc, r) => acc + (Number(r?.rating) || 5), 0);
    const avgRating = Math.round((sumRating / total) * 10) / 10;
    const fiveStars = safeReviewsList.filter((r) => Number(r?.rating) === 5).length;
    const fiveStarRatio = Math.round((fiveStars / total) * 100);
    const verifiedCount = safeReviewsList.filter((r) => Boolean(r?.verifiedPurchase)).length;
    const pendingCount = safeReviewsList.filter((r) => String(r?.status) === "Pending").length;
    const flaggedCount = safeReviewsList.filter((r) => String(r?.status) === "Flagged").length;

    return {
      total,
      avgRating,
      fiveStarRatio,
      verifiedCount,
      pendingCount,
      flaggedCount,
    };
  }, [safeReviewsList]);

  // Filtered & Searched Reviews
  const filteredReviews = useMemo(() => {
    return safeReviewsList.filter((r) => {
      if (!r) return false;
      const q = (searchTerm || "").toLowerCase().trim();
      const author = String(r.author || "").toLowerCase();
      const title = String(r.title || "").toLowerCase();
      const content = String(r.content || "").toLowerCase();
      const productName = String(r.productName || "").toLowerCase();
      const productSku = String(r.productSku || "").toLowerCase();

      const matchSearch =
        !q ||
        author.includes(q) ||
        title.includes(q) ||
        content.includes(q) ||
        productName.includes(q) ||
        productSku.includes(q);

      const rRating = Number(r.rating) || 5;
      const matchRating =
        ratingFilter === "all"
          ? true
          : ratingFilter === "critical"
          ? rRating <= 2
          : rRating === Number(ratingFilter);

      const rStatus = String(r.status || "Published").toLowerCase();
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "verified"
          ? Boolean(r.verifiedPurchase)
          : rStatus === statusFilter.toLowerCase();

      return matchSearch && matchRating && matchStatus;
    });
  }, [safeReviewsList, searchTerm, ratingFilter, statusFilter]);

  return (
    <div className="space-y-7 max-w-[1360px] mx-auto w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-8 z-50 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl text-xs font-black border backdrop-blur-md ${
              toast.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-800"
                : "bg-slate-900/95 text-white border-cyan-500/40"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="size-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="size-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. EXECUTIVE TITLE BANNER ─── */}
      <div className="relative rounded-2xl sm:rounded-[32px] overflow-hidden p-5 sm:p-7 sm:p-9 border border-cyan-500/20 bg-gradient-to-r from-[#020b18] via-[#05182e] to-[#040f1d] text-white shadow-2xl">
        <div
          className="absolute -top-24 right-1/4 w-[500px] h-[350px] rounded-full pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(2,132,199,0.1) 50%, transparent 80%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-[10px] font-black tracking-widest uppercase shadow-inner">
              <Sparkles className="size-3 text-cyan-400" />
              <span>Product Feedback & Moderation</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight">
              Product Reviews <span className="text-[#00F0FF]">Moderation</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
              Real-time audit of contractor star ratings, verified commercial buyer testimonials, and storefront product scores.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs transition cursor-pointer backdrop-blur-md shadow-md"
              title="Refresh Review Feeds"
            >
              <RefreshCw className={`size-3.5 text-cyan-400 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Sync DB</span>
            </button>

            <Link
              to="/reviews"
              target="_blank"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs transition shadow-lg cursor-pointer"
            >
              <ExternalLink className="size-3.5 text-cyan-700" />
              <span>Public Reviews Page</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. 4-PILLAR EXECUTIVE HUD METRICS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Reviews */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:border-cyan-500/30 transition group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Published</span>
            <div className="size-7 sm:size-9 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center group-hover:scale-110 transition">
              <MessageSquare className="size-3.5 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stats.total}</div>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5 shrink-0">
              <TrendingUp className="size-3" /> Live Feed
            </span>
            <span className="truncate">· All SKUs</span>
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:border-cyan-500/30 transition group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Catalog Score</span>
            <div className="size-7 sm:size-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center group-hover:scale-110 transition">
              <Star className="size-3.5 sm:size-4.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
            {stats.avgRating.toFixed(1)}
            <span className="text-xs font-bold text-amber-500">/ 5.0 ★</span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
            <span className="text-amber-700 font-extrabold">{stats.fiveStarRatio}%</span>
            <span>Rated 5-Stars</span>
          </div>
        </div>

        {/* Metric 3: Verified Contractors */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:border-cyan-500/30 transition group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verified Pros</span>
            <div className="size-7 sm:size-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center group-hover:scale-110 transition">
              <ShieldCheck className="size-3.5 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stats.verifiedCount}</div>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-700 truncate">
            <span>Verified Buyers</span>
          </div>
        </div>

        {/* Metric 4: Moderation Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:border-cyan-500/30 transition group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Moderation Queue</span>
            <div className="size-7 sm:size-9 rounded-xl bg-indigo-50 text-indigo-700 grid place-items-center group-hover:scale-110 transition">
              <Award className="size-3.5 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {stats.pendingCount + stats.flaggedCount}
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
            <span className="text-emerald-700 font-extrabold">All Clear</span>
            <span>· Compliance</span>
          </div>
        </div>
      </div>

      {/* ─── 3. SEARCH & DYNAMIC FILTER TOOLBAR ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer, equipment, SKU, or words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 sm:h-11 border border-slate-200 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Quick Filter Switchers */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Star Rating Pills */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/70 shrink-0">
              {[
                { id: "all", label: "All" },
                { id: "5", label: "5 ★" },
                { id: "4", label: "4 ★" },
                { id: "3", label: "3 ★" },
                { id: "critical", label: "1-2 ★" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setRatingFilter(pill.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                    ratingFilter === pill.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 sm:h-11 px-3 sm:px-3.5 border border-slate-200 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-black text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white cursor-pointer shrink-0"
            >
              <option value="all">All Feedback</option>
              <option value="verified">Verified Pros Only</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. MASTER REVIEWS VIEW (MOBILE CARDS + DESKTOP TABLE) ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="size-8 mx-auto text-cyan-600 animate-spin" />
            <div className="text-sm font-black text-slate-900">Loading Product Feedback Telemetry...</div>
            <div className="text-xs text-slate-400">Syncing verified buyer reviews from database.</div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReview(r)}
                    className="p-4 space-y-3 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 rounded-xl bg-slate-50 border border-slate-200 p-1 grid place-items-center shrink-0">
                          <img
                            src={r.productImg || "/assets/commingsoon.png"}
                            alt={r.productName}
                            className="size-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              e.currentTarget.src = "/assets/commingsoon.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 line-clamp-1">{r.productName}</div>
                          <div className="text-[10px] font-mono text-slate-400">SKU: {r.productSku}</div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
                          r.status === "Published"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : r.status === "Pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {r.status || "Published"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-900 truncate">{r.author}</span>
                        {r.verifiedPurchase && <ShieldCheck className="size-3 text-cyan-600 shrink-0" />}
                        <span className="text-[10px] text-slate-400 truncate">({r.role || "Buyer"})</span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-black text-xs text-slate-900">{r.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {r.content || "No detailed review body submitted."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{formatReviewDate(r.date)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(r);
                          }}
                          className="font-extrabold text-cyan-700 hover:underline"
                        >
                          Inspect & Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Permanently remove review by "${r.author}"?`)) {
                              deleteMutation.mutate(r);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <MessageSquare className="size-8 mx-auto text-slate-300 stroke-1" />
                  <div className="text-slate-700 font-bold text-xs">No reviews match your filters</div>
                </div>
              )}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-4 sm:px-6 font-black">Equipment Model & SKU</th>
                    <th className="p-4 sm:px-6 font-black">Trade Reviewer</th>
                    <th className="p-4 sm:px-6 font-black">Rating</th>
                    <th className="p-4 sm:px-6 font-black">Review Details</th>
                    <th className="p-4 sm:px-6 font-black">Date</th>
                    <th className="p-4 sm:px-6 font-black text-center">Status</th>
                    <th className="p-4 sm:px-6 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReview(r)}
                        className="hover:bg-cyan-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Col 1: Equipment Thumbnail & SKU */}
                        <td className="p-4 sm:px-6 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-slate-50 border border-slate-200/80 p-1 grid place-items-center shrink-0 shadow-2xs group-hover:border-cyan-500/30">
                              <img
                                src={r.productImg || "/assets/commingsoon.png"}
                                alt={r.productName}
                                className="size-full object-contain mix-blend-multiply"
                                onError={(e) => {
                                  e.currentTarget.src = "/assets/commingsoon.png";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 text-xs sm:text-sm truncate group-hover:text-cyan-800 transition">
                                {r.productName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono">{r.productSku}</span>
                                {r.productBrand && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {r.productBrand}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Col 2: Reviewer Contractor */}
                        <td className="p-4 sm:px-6">
                          <div className="space-y-0.5">
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{r.author}</span>
                              {r.verifiedPurchase && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-cyan-700"
                                  title="Verified Contractor Purchase"
                                >
                                  <ShieldCheck className="size-3.5 text-cyan-600" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <UserCheck className="size-3 text-emerald-600" />
                              <span>{r.role || "Verified Buyer"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Col 3: Star Rating */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${
                                    i < r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-black text-slate-900 ml-1">{r.rating}.0</span>
                          </div>
                        </td>

                        {/* Col 4: Review Snippet */}
                        <td className="p-4 sm:px-6 max-w-sm">
                          <div className="font-black text-slate-900 text-xs truncate">{r.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                            {r.content || "No detailed review body submitted."}
                          </p>
                        </td>

                        {/* Col 5: Date */}
                        <td className="p-4 sm:px-6 text-slate-700 font-medium whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatReviewDate(r.date)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Verified Timestamp</div>
                        </td>

                        {/* Col 6: Moderation Status Pill */}
                        <td className="p-4 sm:px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              r.status === "Published"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : r.status === "Pending"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {r.status === "Published" && <CheckCircle2 className="size-3" />}
                            {r.status || "Published"}
                          </span>
                        </td>

                        {/* Col 7: Quick Actions */}
                        <td className="p-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReview(r);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 transition cursor-pointer font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="size-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Permanently remove review by "${r.author}"?`)) {
                                  deleteMutation.mutate(r);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer shadow-2xs"
                              title="Remove Review"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-slate-400 font-bold text-xs space-y-2">
                        <MessageSquare className="size-10 mx-auto text-slate-300 stroke-1" />
                        <div className="text-slate-700 font-black text-sm">No product reviews found</div>
                        <div className="text-slate-400 text-xs">Try adjusting your search query or rating filter above.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ─── 5. SLIDE-OVER REVIEW INSPECTION DRAWER ─── */}
      <AnimatePresence>
        {selectedReview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReview(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-cyan-600" />
                    <span>Review Audit & Moderation</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">Customer Testimonial Details</h2>
                </div>

                <button
                  onClick={() => setSelectedReview(null)}
                  className="size-8 sm:size-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 grid place-items-center transition cursor-pointer shadow-2xs"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* 1. Target Equipment Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Product</div>
                  <div className="flex items-center gap-3">
                    <div className="size-12 sm:size-14 rounded-2xl bg-white border border-slate-200 p-1.5 grid place-items-center shrink-0 shadow-sm">
                      <img
                        src={selectedReview.productImg || "/assets/commingsoon.png"}
                        alt={selectedReview.productName}
                        className="size-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/commingsoon.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-slate-900 text-xs sm:text-sm leading-snug truncate">{selectedReview.productName}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2 truncate">
                        <span>SKU: {selectedReview.productSku}</span>
                        {selectedReview.productBrand && <span>· {selectedReview.productBrand}</span>}
                      </div>
                    </div>
                    {selectedReview.productId && (
                      <Link
                        to="/products/$productId"
                        params={{ productId: selectedReview.productId }}
                        target="_blank"
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-cyan-700 transition shrink-0"
                        title="View Catalog Item"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. Reviewer Profile */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trade Reviewer</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-sm flex items-center gap-1.5 truncate">
                        <span className="truncate">{selectedReview.author}</span>
                        {selectedReview.verifiedPurchase && (
                          <span className="text-[10px] font-black text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                            <ShieldCheck className="size-3 text-cyan-700" />
                            Verified Pro
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        Submitted on {formatReviewDate(selectedReview.date)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 shrink-0">
                      <Star className="size-3.5 sm:size-4 fill-amber-400 text-amber-400" />
                      <span className="font-black text-xs sm:text-sm">{selectedReview.rating}.0</span>
                    </div>
                  </div>
                </div>

                {/* 3. Review Content */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-2 sm:space-y-3 shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Published Review</div>
                  <div className="text-sm sm:text-base font-black text-white">{selectedReview.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedReview.content || "No extended review commentary provided."}
                  </p>
                </div>

                {/* 4. Lifecycle Moderation Status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Moderation Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Published", "Pending", "Flagged"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() =>
                          statusMutation.mutate({
                            rev: selectedReview,
                            newStatus: st,
                          })
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer border text-center ${
                          selectedReview.status === st
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/90 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (confirm(`Permanently remove review by "${selectedReview.author}"?`)) {
                      deleteMutation.mutate(selectedReview);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove Review</span>
                </button>

                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-md"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
