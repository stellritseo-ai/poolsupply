import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import pentair from "@/assets/logos/pentair.png";
import hayward from "@/assets/logos/hayward.jpg";
import jandy from "@/assets/logos/jandy_logo.png";
import waterway from "@/assets/logos/w1.png";
import raypak from "@/assets/logos/logo_dark.png";

const brands = [
  { name: "Pentair", slug: "pentair", logo: pentair, specialty: "Pumps & Automation" },
  { name: "Hayward", slug: "hayward", logo: hayward, specialty: "Heaters & Cleaners" },
  { name: "Jandy", slug: "jandy", logo: jandy, specialty: "Valves & Heat Pumps" },
  { name: "Raypak", slug: "raypak", logo: raypak, specialty: "Commercial Gas Heaters" },
  { name: "Waterway", slug: "waterway", logo: waterway, specialty: "Plumbing & Manifolds" },
];

export function Brands() {
  // Repeat items for smooth infinite CSS loop
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section id="brands" className="relative py-[50px] overflow-hidden isolate bg-slate-950 text-white border-y border-white/10">
      {/* Background Cinematic Video & Layered Overlays */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-105 contrast-110"
        >
          <source src="https://res.cloudinary.com/dmanafb84/video/upload/v1787602658/pools_phemjp.mp4" type="video/mp4" />
        </video>
        {/* Layered Cinematic Overlays */}
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />

        {/* Ambient Radial Mesh Glows */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 mb-8 sm:mb-10 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-[11px] font-bold uppercase tracking-widest shadow-xl mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          Direct Manufacturer Authorized
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white">
          Built with the world's <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-white">most trusted brands.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Direct trade access to authentic OEM pool equipment with full factory warranty and verified commercial supply chains.
        </p>
      </div>

      {/* Smooth GPU Hardware-Accelerated Marquee */}
      <div className="relative w-full overflow-hidden py-4 z-10">
        {/* Left & Right Soft Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />

        {/* Sliding Track (100% GPU off-thread CSS Animation) */}
        <div className="flex w-max">
          <div className="flex gap-4 sm:gap-6 px-3 animate-marquee will-change-transform">
            {duplicatedBrands.map((b, i) => (
              <Link
                key={`${b.name}-${i}`}
                to="/brands/$brand"
                params={{ brand: b.slug }}
                className="group relative flex flex-col justify-between w-56 h-28 sm:w-60 sm:h-30 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_45px_-10px_rgba(6,182,212,0.45)] hover:border-cyan-400 hover:bg-white hover:-translate-y-1.5 transition-all duration-300 shrink-0 select-none cursor-pointer overflow-hidden"
              >
                {/* Subtle top glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-cyan-700 transition-colors">
                    <span className="size-1 rounded-full bg-slate-300 group-hover:bg-cyan-500 transition-colors" />
                    {b.specialty}
                  </span>
                  <ArrowUpRight className="size-3.5 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div className="flex-1 flex items-center justify-center py-1 z-10">
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    loading="lazy"
                    className="max-h-11 max-w-[78%] object-contain opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors z-10 pt-1.5 border-t border-slate-100">
                  <span>{b.name}</span>
                  <span className="text-[9px] uppercase tracking-wider text-cyan-600 font-extrabold">Authorized</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
