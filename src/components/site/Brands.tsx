import { motion } from "framer-motion";
import pentair from "@/assets/logos/pentair.png";
import hayward from "@/assets/logos/hayward.jpg";
import jandy from "@/assets/logos/jandy_logo.png";
import waterway from "@/assets/logos/w1.png";
import raypak from "@/assets/logos/logo_dark.png";
import brandVideo from "@/assets/video/pools.mp4";

const brands = [
  { name: "Pentair", logo: pentair },
  { name: "Hayward", logo: hayward },
  { name: "Jandy", logo: jandy },
  { name: "Raypak", logo: raypak },
  { name: "Waterway", logo: waterway },
];

export function Brands() {
  // Quadruple the items to ensure smooth infinite loop without blank gaps
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section id="brands" className="relative py-20 lg:py-24 overflow-hidden isolate">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src={brandVideo} type="video/mp4" />
        </video>
        {/* Soft light/glass overlay for high-end contrast */}
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] transition-all" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold font-sans">Featured Brands</span>
        <h2 className="mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Built with the world's most trusted manufacturers.
        </h2>
      </div>

      {/* Infinite Slider Wrapper */}
      <div className="relative w-full overflow-hidden py-4 z-10">
        {/* Soft fading gradients on edges for a high-end look */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/75 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/75 to-transparent z-10 pointer-events-none" />

        {/* Sliding track */}
        <div className="flex w-max">
          <motion.div
            className="flex gap-6 px-3 will-change-transform"
            animate={{ x: [0, "-50%"] }}
            transition={{
              ease: "linear",
              duration: 22,
              repeat: Infinity,
            }}
          >
            {duplicatedBrands.map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="flex items-center justify-center w-48 h-24 rounded-2xl glass hover:bg-white/95 hover:shadow-[var(--shadow-soft)] hover:border-primary/30 transition-all duration-300 group shrink-0"
              >
                <img
                  src={b.logo}
                  alt={`${b.name} logo`}
                  className="max-h-12 max-w-[70%] object-contain opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
