import { motion } from "framer-motion";
import { Star, ShieldCheck, Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Reilly",
    role: "Owner, BlueWave Pools",
    location: "Miami, FL",
    quote: "Pool Supply Wholesalers has been our go-to distributor for 5 years. The wholesale pricing, tech expertise, and same-day dispatch are completely unmatched.",
    verified: "Verified Trade Partner",
    rating: 5,
    avatarBg: "from-cyan-500 to-blue-600",
  },
  {
    name: "Sarah Chen",
    role: "Lead Tech, Sunset Pool Service",
    location: "Phoenix, AZ",
    quote: "Their automation specialists helped us spec out 40 commercial heat pump installs last season. The support alone is worth switching suppliers.",
    verified: "Verified Contractor",
    rating: 5,
    avatarBg: "from-blue-600 to-indigo-600",
  },
  {
    name: "David Alvarez",
    role: "Founder, Crystal Clear Pools",
    location: "Austin, TX",
    quote: "100% genuine OEM parts every single time, fast delivery, and a real certified pool tech on the phone whenever we have sizing questions.",
    verified: "Verified Trade Partner",
    rating: 5,
    avatarBg: "from-teal-500 to-cyan-600",
  },
  {
    name: "Jason Miller",
    role: "Operations Manager, Aquapro Service",
    location: "Las Vegas, NV",
    quote: "We order variable speed pumps in bulk every month. Their trade pricing gives us a competitive edge that no other supplier can match.",
    verified: "Verified Commercial Buyer",
    rating: 5,
    avatarBg: "from-indigo-500 to-sky-600",
  },
  {
    name: "Robert Vance",
    role: "Director, Vance Pool & Spa",
    location: "Nashville, TN",
    quote: "Same-day shipping for orders before 2 PM has saved our job schedules multiple times. Best customer service team in the pool industry.",
    verified: "Verified Trade Partner",
    rating: 5,
    avatarBg: "from-cyan-600 to-emerald-600",
  },
  {
    name: "Elena Rostova",
    role: "Chief Technician, Sunbelt Aquatics",
    location: "Tampa, FL",
    quote: "The online portal makes recurring bulk orders effortless. Highly reliable inventory tracking and premium equipment warranties.",
    verified: "Verified Contractor",
    rating: 5,
    avatarBg: "from-sky-500 to-blue-700",
  },
];

// Duplicate items list twice for seamless 100% infinite marquee loop
const infiniteItems = [...testimonials, ...testimonials];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50/60 overflow-hidden font-sans relative">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 mb-14 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-700 text-xs font-bold uppercase tracking-widest shadow-2xs">
              <Sparkles className="size-3.5 text-cyan-600" /> Loved By Pool Professionals
            </span>
            <h2
              className="text-slate-900 tracking-tight leading-tight"
              style={{ fontSize: "29px", fontWeight: 900 }}
            >
              Trusted by 5,000+ Pool Contractors Nationwide
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex -space-x-2 overflow-hidden">
              {testimonials.slice(0, 4).map((t, idx) => (
                <div key={idx} className={`inline-block size-8 rounded-full ring-2 ring-white bg-gradient-to-br ${t.avatarBg} text-white font-bold text-[10px] grid place-items-center`}>
                  {t.name[0]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">4.9 / 5.0 Rating (1,200+ Reviews)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Horizontal Sliding Marquee Track */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Soft Fade Masks */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

        <motion.div
          className="flex gap-6 w-max cursor-grab active:cursor-grabbing"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 35,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {infiniteItems.map((t, i) => (
            <figure
              key={`${t.name}-${i}`}
              className="w-[340px] sm:w-[400px] shrink-0 p-7 rounded-[2.2rem] bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Quote Mark Watermark */}
              <Quote className="absolute top-6 right-6 size-10 text-slate-100 group-hover:text-cyan-50 transition-colors pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <ShieldCheck className="size-3 text-emerald-600" /> {t.verified}
                  </span>
                </div>

                {/* Quote Text */}
                <blockquote className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                  "{t.quote}"
                </blockquote>
              </div>

              {/* Author & Footer */}
              <figcaption className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3.5 relative z-10">
                <div className={`size-11 rounded-2xl bg-gradient-to-br ${t.avatarBg} text-white font-extrabold text-sm grid place-items-center shadow-md shrink-0`}>
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>

                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-slate-900 truncate">{t.name}</div>
                  <div className="text-[11px] font-semibold text-slate-400 truncate">
                    {t.role} · <span className="text-slate-500">{t.location}</span>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
