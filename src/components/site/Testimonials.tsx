import { motion } from "framer-motion";
import { Star, ShieldCheck, CheckCircle2, Award, Sparkles, ThumbsUp } from "lucide-react";

function GoogleGIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  );
}

// Row 1 Reviews (Slide Right to Left)
const row1Reviews = [
  {
    name: "Marcus Reilly",
    role: "Owner, BlueWave Pools",
    location: "Miami, FL",
    date: "2 days ago",
    quote: "Pool Supply Wholesalers has been our primary equipment source for 5+ years. OEM Pentair and Hayward gear arrives palletized next day. Wholesale pricing saves our business $30k+ annually.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Pentair IntelliFlo3 VSF 3.0HP",
    avatarBg: "from-cyan-600 to-blue-700",
  },
  {
    name: "Sarah Chen",
    role: "Lead Tech, Sunset Pool Service",
    location: "Phoenix, AZ",
    date: "4 days ago",
    quote: "Their automation tech specialists helped us size 40 commercial heat pump installs last season. Direct warranty registration with factory backing gives us complete peace of mind.",
    verified: "Verified Google Contractor",
    rating: 5,
    product: "Raypak 406A Natural Gas Heater",
    avatarBg: "from-blue-600 to-indigo-700",
  },
  {
    name: "David Alvarez",
    role: "Founder, Crystal Clear Pools",
    location: "Austin, TX",
    date: "1 week ago",
    quote: "100% genuine factory sealed OEM parts every single time. Whenever we have complex hydraulic questions, a certified master pool technician answers on the first ring.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Hayward SwimClear 425 Sq Ft",
    avatarBg: "from-teal-600 to-cyan-700",
  },
  {
    name: "Jason Miller",
    role: "Operations Mgr, Aquapro Service",
    location: "Las Vegas, NV",
    date: "1 week ago",
    quote: "We order variable speed pumps and saltwater systems in bulk every month. The wholesale trade margins allow us to win commercial builder contracts consistently.",
    verified: "Verified Google Buyer",
    rating: 5,
    product: "Jandy FloPro 2.0 HP VS Pump",
    avatarBg: "from-indigo-600 to-sky-700",
  },
  {
    name: "Robert Vance",
    role: "Director, Vance Pool & Spa",
    location: "Nashville, TN",
    date: "2 weeks ago",
    quote: "Same-day dispatch for orders placed before 2 PM has saved our job schedules countless times. Outstanding customer support and genuine manufacturer warranties.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Pentair MasterTemp 400K BTU",
    avatarBg: "from-cyan-700 to-emerald-700",
  },
  {
    name: "Elena Rostova",
    role: "Chief Tech, Sunbelt Aquatics",
    location: "Tampa, FL",
    date: "2 weeks ago",
    quote: "The contractor portal makes recurring bulk orders completely effortless. Zero backorder delays, authentic OEM serials, and real-time pallet freight tracking.",
    verified: "Verified Google Contractor",
    rating: 5,
    product: "Pentair Clean & Clear Plus 520",
    avatarBg: "from-sky-600 to-blue-800",
  },
];

// Row 2 Reviews (Slide Left to Right)
const row2Reviews = [
  {
    name: "Brandon Mitchell",
    role: "Director of Operations, Desert Oasis",
    location: "Scottsdale, AZ",
    date: "3 days ago",
    quote: "Switched from local branch distributors 2 years ago. Better inventory availability, true wholesale pricing, and spotless packaging on sensitive automation control boards.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Pentair IntelliCenter Automation",
    avatarBg: "from-amber-600 to-orange-700",
  },
  {
    name: "Carlos Mendez",
    role: "Owner, Premier Pool Works",
    location: "San Diego, CA",
    date: "5 days ago",
    quote: "The most dependable commercial pool supply partner in the country. Every pump and filter is fresh factory inventory with intact manufacturer serials for warranty validation.",
    verified: "Verified Google Contractor",
    rating: 5,
    product: "Hayward TriStar VS 900",
    avatarBg: "from-emerald-600 to-teal-700",
  },
  {
    name: "Anthony Romano",
    role: "Master Electrician, Aqua Tech Solutions",
    location: "Orlando, FL",
    date: "1 week ago",
    quote: "Their LED lighting and underwater transformer catalog is top-notch. Fast LTL freight with liftgate service delivered straight to our shop floor.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Pentair MicroBrite Color LED 100ft",
    avatarBg: "from-purple-600 to-indigo-700",
  },
  {
    name: "Michael Vance",
    role: "Facilities Lead, Blue Lagoon Resorts",
    location: "Myrtle Beach, SC",
    date: "2 weeks ago",
    quote: "Managing 18 commercial resort pools requires zero downtime. They overnighted dual high-capacity chlorinators that arrived at our resort gate before 9 AM.",
    verified: "Verified Google Buyer",
    rating: 5,
    product: "AutoPilot Pool Pilot Digital 75003",
    avatarBg: "from-rose-600 to-pink-700",
  },
  {
    name: "Derek Hoffmann",
    role: "Lead Contractor, Hoffmann Aquatics",
    location: "Dallas, TX",
    date: "3 weeks ago",
    quote: "Top-tier technical support. You get connected to experienced pool hydraulic specialists who know pump flow curves and electrical specs inside and out.",
    verified: "Verified Google Contractor",
    rating: 5,
    product: "Pentair WhisperFloXF VS 5.0HP",
    avatarBg: "from-cyan-600 to-teal-800",
  },
  {
    name: "Tyler Jenkins",
    role: "Owner, Apex Pool & Spa",
    location: "Atlanta, GA",
    date: "3 weeks ago",
    quote: "Unbeatable wholesale trade tiering. Ordering 5+ pumps unlocked additional volume rebates that directly impacted our bottom-line business profitability.",
    verified: "Verified Google Trade Review",
    rating: 5,
    product: "Hayward Super Pump VS 700",
    avatarBg: "from-blue-700 to-cyan-800",
  },
];

// Duplicate each list for seamless 100% infinite CSS marquee tracks
const infiniteRow1 = [...row1Reviews, ...row1Reviews];
const infiniteRow2 = [...row2Reviews, ...row2Reviews];

function ReviewCard({ review }: { review: (typeof row1Reviews)[0] }) {
  return (
    <figure className="w-[300px] sm:w-[380px] md:w-[400px] shrink-0 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-cyan-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group select-none">
      <div className="space-y-2.5 sm:space-y-3 relative z-10">
        {/* Top Header: Author + Google Verified Badge */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${review.avatarBg} text-white font-black text-xs sm:text-sm grid place-items-center shadow-xs shrink-0`}
            >
              {review.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1">
                <span className="truncate">{review.name}</span>
                <CheckCircle2 className="size-3 sm:size-3.5 text-blue-500 shrink-0" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
                {review.role} · <span className="text-slate-400">{review.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-slate-50 border border-slate-200/80 shrink-0 shadow-2xs">
            <GoogleGIcon className="size-3 sm:size-3.5" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-600">Google</span>
          </div>
        </div>

        {/* Rating & Post Timestamp */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: review.rating }).map((_, k) => (
              <Star key={k} className="size-3 sm:size-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 ml-1">5.0</span>
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-slate-400">{review.date}</span>
        </div>

        {/* Review Quote */}
        <blockquote className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-medium line-clamp-3 sm:line-clamp-4">
          "{review.quote}"
        </blockquote>
      </div>

      {/* Card Footer: Verified Product Tag */}
      <figcaption className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] relative z-10">
        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-cyan-50/70 border border-cyan-200/60 text-cyan-900 font-extrabold text-[9.5px] sm:text-[10.5px] truncate max-w-[180px] sm:max-w-[260px]">
          <ShieldCheck className="size-2.5 sm:size-3 text-cyan-600 shrink-0" />
          <span className="truncate">{review.product}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
          <CheckCircle2 className="size-2.5 text-emerald-600" /> Verified
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden font-sans relative border-y border-slate-200/60">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2.5 sm:space-y-3">
            {/* Verified Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
                <GoogleGIcon className="size-3.5 sm:size-4 shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 tracking-wide">
                  Google Verified Customer Reviews
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-2xs text-emerald-800 text-[11px] sm:text-xs font-extrabold">
                <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-600 shrink-0" />
                <span>100% Authentic Trade Accounts</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Rated 4.9 / 5.0 by <span className="text-gradient">5,000+ Pool Professionals</span> Nationwide
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">
              Real reviews from licensed pool contractors, commercial resort operators, and service technicians who rely on our wholesale pricing and same-day dispatch.
            </p>
          </div>

          {/* Google 4.9 Star Aggregate Rating Card */}
          <div className="flex items-center gap-3.5 sm:gap-4 bg-white p-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200/90 shadow-sm shrink-0 self-start md:self-auto">
            <div className="flex items-center justify-center size-11 sm:size-12 rounded-xl bg-slate-50 border border-slate-100 shrink-0 shadow-2xs">
              <GoogleGIcon className="size-6 sm:size-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900">4.9</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="size-3.5 sm:size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1.5">
                <span>480+ Google Reviews</span>
                <span className="size-1 rounded-full bg-slate-300" />
                <span className="text-emerald-600 font-extrabold">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Row Dual-Direction Sliding Marquee */}
      <div className="space-y-3 sm:space-y-4 relative w-full overflow-hidden">
        {/* Left & Right Seamless Gradient Masks */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 sm:w-36 md:w-44 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-20" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-16 sm:w-36 md:w-44 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-20" />

        {/* Row 1: Sliding Right to Left */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-3 sm:gap-4 md:gap-5 w-max animate-marquee cursor-grab active:cursor-grabbing">
            {infiniteRow1.map((review, i) => (
              <ReviewCard key={`r1-${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>

        {/* Row 2: Sliding Left to Right */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-3 sm:gap-4 md:gap-5 w-max animate-marquee-reverse cursor-grab active:cursor-grabbing">
            {infiniteRow2.map((review, i) => (
              <ReviewCard key={`r2-${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
